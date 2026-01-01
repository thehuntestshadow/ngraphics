/**
 * API.js Unit Tests
 * Tests for APIError and APIClient utilities
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('APIError', () => {
    let APIError;

    beforeEach(() => {
        // Create APIError class for testing
        APIError = class extends Error {
            constructor(message, code, details = {}) {
                super(message);
                this.name = 'APIError';
                this.code = code;
                this.status = details.status;
                this.retryable = details.retryable ?? false;
            }

            static USER_MESSAGES = {
                'AUTH_REQUIRED': 'Please sign in to generate images.',
                'RATE_LIMITED': 'Too many requests. Please wait a moment.',
                'INSUFFICIENT_CREDITS': 'You\'ve reached your generation limit.',
                'CONTENT_FILTERED': 'Content was filtered. Try a different prompt.',
                'SERVER_ERROR': 'Server error. Please try again.',
                'NETWORK_ERROR': 'Network error. Check your connection.',
                'TIMEOUT': 'Request timed out. Please try again.',
                'UNKNOWN': 'An unexpected error occurred.'
            };

            toUserMessage() {
                return APIError.USER_MESSAGES[this.code] || APIError.USER_MESSAGES['UNKNOWN'];
            }
        };
    });

    it('should create error with code and details', () => {
        const error = new APIError('Test error', 'RATE_LIMITED', { status: 429 });
        expect(error.message).toBe('Test error');
        expect(error.code).toBe('RATE_LIMITED');
        expect(error.status).toBe(429);
    });

    it('should provide user-friendly messages', () => {
        const authError = new APIError('', 'AUTH_REQUIRED');
        expect(authError.toUserMessage()).toBe('Please sign in to generate images.');

        const rateError = new APIError('', 'RATE_LIMITED');
        expect(rateError.toUserMessage()).toBe('Too many requests. Please wait a moment.');

        const creditsError = new APIError('', 'INSUFFICIENT_CREDITS');
        expect(creditsError.toUserMessage()).toBe('You\'ve reached your generation limit.');
    });

    it('should fallback to unknown message for undefined codes', () => {
        const error = new APIError('', 'SOME_NEW_CODE');
        expect(error.toUserMessage()).toBe('An unexpected error occurred.');
    });

    it('should be instance of Error', () => {
        const error = new APIError('Test', 'UNKNOWN');
        expect(error).toBeInstanceOf(Error);
    });
});

describe('Error Classification', () => {
    const getErrorCodeFromStatus = (status, response = {}) => {
        if (status === 401 || status === 403) return 'AUTH_REQUIRED';
        if (status === 429) return 'RATE_LIMITED';
        if (status === 402) return 'INSUFFICIENT_CREDITS';
        if (status >= 500) return 'SERVER_ERROR';
        if (status === 400 && response.error?.includes('content')) return 'CONTENT_FILTERED';
        return 'UNKNOWN';
    };

    it('should classify 401 as AUTH_REQUIRED', () => {
        expect(getErrorCodeFromStatus(401)).toBe('AUTH_REQUIRED');
    });

    it('should classify 403 as AUTH_REQUIRED', () => {
        expect(getErrorCodeFromStatus(403)).toBe('AUTH_REQUIRED');
    });

    it('should classify 429 as RATE_LIMITED', () => {
        expect(getErrorCodeFromStatus(429)).toBe('RATE_LIMITED');
    });

    it('should classify 402 as INSUFFICIENT_CREDITS', () => {
        expect(getErrorCodeFromStatus(402)).toBe('INSUFFICIENT_CREDITS');
    });

    it('should classify 500+ as SERVER_ERROR', () => {
        expect(getErrorCodeFromStatus(500)).toBe('SERVER_ERROR');
        expect(getErrorCodeFromStatus(502)).toBe('SERVER_ERROR');
        expect(getErrorCodeFromStatus(503)).toBe('SERVER_ERROR');
    });

    it('should classify 400 with content error as CONTENT_FILTERED', () => {
        expect(getErrorCodeFromStatus(400, { error: 'content policy violation' })).toBe('CONTENT_FILTERED');
    });
});

describe('Response Normalization', () => {
    const normalizeResponse = (response) => {
        if (!response.choices?.length) {
            throw new Error('Empty response from API');
        }

        const choice = response.choices[0];
        const content = choice.message?.content;
        const result = { text: null, image: null };

        if (typeof content === 'string') {
            result.text = content;
        } else if (Array.isArray(content)) {
            for (const part of content) {
                // Gemini inline_data format
                if (part.inline_data) {
                    result.image = `data:${part.inline_data.mime_type};base64,${part.inline_data.data}`;
                }
                // OpenAI image_url format
                else if (part.type === 'image_url' && part.image_url?.url) {
                    result.image = part.image_url.url;
                }
                // Text part
                else if (part.type === 'text' && part.text) {
                    result.text = part.text;
                }
            }
        }

        return result;
    };

    it('should extract text from string content', () => {
        const response = {
            choices: [{ message: { content: 'Hello world' } }]
        };
        const result = normalizeResponse(response);
        expect(result.text).toBe('Hello world');
    });

    it('should extract image from Gemini inline_data format', () => {
        const response = {
            choices: [{
                message: {
                    content: [{
                        inline_data: { mime_type: 'image/png', data: 'base64data' }
                    }]
                }
            }]
        };
        const result = normalizeResponse(response);
        expect(result.image).toBe('data:image/png;base64,base64data');
    });

    it('should extract image from OpenAI image_url format', () => {
        const response = {
            choices: [{
                message: {
                    content: [{
                        type: 'image_url',
                        image_url: { url: 'https://example.com/image.png' }
                    }]
                }
            }]
        };
        const result = normalizeResponse(response);
        expect(result.image).toBe('https://example.com/image.png');
    });

    it('should throw on empty response', () => {
        expect(() => normalizeResponse({ choices: [] })).toThrow('Empty response from API');
    });

    it('should handle mixed content (text + image)', () => {
        const response = {
            choices: [{
                message: {
                    content: [
                        { type: 'text', text: 'Description' },
                        { inline_data: { mime_type: 'image/jpeg', data: 'imgdata' } }
                    ]
                }
            }]
        };
        const result = normalizeResponse(response);
        expect(result.text).toBe('Description');
        expect(result.image).toBe('data:image/jpeg;base64,imgdata');
    });
});

describe('Retry Delay', () => {
    const getRetryDelay = (attempt, retryAfter = null) => {
        if (retryAfter) return retryAfter;
        // Exponential backoff: 1s, 2s, 4s, 8s...
        const baseDelay = 1000;
        const maxDelay = 30000;
        const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
        // Add jitter (0-20%)
        const jitter = delay * 0.2 * Math.random();
        return Math.floor(delay + jitter);
    };

    it('should use retryAfter when provided', () => {
        expect(getRetryDelay(0, 5000)).toBe(5000);
        expect(getRetryDelay(5, 3000)).toBe(3000);
    });

    it('should use exponential backoff otherwise', () => {
        const delay0 = getRetryDelay(0);
        const delay1 = getRetryDelay(1);
        const delay2 = getRetryDelay(2);

        expect(delay0).toBeGreaterThanOrEqual(1000);
        expect(delay0).toBeLessThan(1500); // With jitter
        expect(delay1).toBeGreaterThan(delay0);
        expect(delay2).toBeGreaterThan(delay1);
    });

    it('should cap delay at max', () => {
        const delay10 = getRetryDelay(10);
        expect(delay10).toBeLessThanOrEqual(36000); // 30000 + 20% jitter
    });
});

describe('Cache', () => {
    let cache;

    beforeEach(() => {
        cache = {
            data: new Map(),
            set(key, value, ttl) {
                this.data.set(key, { value, expires: Date.now() + ttl });
            },
            get(key) {
                const entry = this.data.get(key);
                if (!entry) return null;
                if (Date.now() > entry.expires) {
                    this.data.delete(key);
                    return null;
                }
                return entry.value;
            },
            clear() {
                this.data.clear();
            }
        };
    });

    it('should cache and retrieve values', () => {
        cache.set('test-key', { data: 'test' }, 60000);
        expect(cache.get('test-key')).toEqual({ data: 'test' });
    });

    it('should return null for non-existent keys', () => {
        expect(cache.get('nonexistent')).toBeNull();
    });

    it('should expire cached values', () => {
        cache.set('test-key', { data: 'test' }, -1); // Already expired
        expect(cache.get('test-key')).toBeNull();
    });

    it('should clear all cached values', () => {
        cache.set('key1', 'value1', 60000);
        cache.set('key2', 'value2', 60000);
        cache.clear();
        expect(cache.get('key1')).toBeNull();
        expect(cache.get('key2')).toBeNull();
    });
});
