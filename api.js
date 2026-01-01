/**
 * HEFAISTOS - Unified API Client
 * Centralized OpenRouter API handling with retries, rate limiting, and response normalization
 */

// ============================================
// API ERROR CLASS
// ============================================
class APIError extends Error {
    constructor(message, code, details = {}) {
        super(message);
        this.name = 'APIError';
        this.code = code;
        this.status = details.status || null;
        this.retryable = details.retryable || false;
        this.retryAfter = details.retryAfter || null;
        this.originalError = details.originalError || null;
    }

    // User-friendly error messages
    toUserMessage() {
        const messages = {
            'RATE_LIMITED': 'Too many requests. Please wait a moment and try again.',
            'TIMEOUT': 'Request timed out. The server is taking too long to respond.',
            'NETWORK_ERROR': 'Network error. Please check your internet connection.',
            'AUTH_REQUIRED': 'Please sign in to generate images.',
            'SUBSCRIPTION_REQUIRED': 'A subscription is required. Upgrade to Pro or Business.',
            'AUTH_ERROR': 'Authentication error. Please sign in again.',
            'INVALID_REQUEST': 'Invalid request. Please check your inputs.',
            'MODEL_ERROR': 'The AI model encountered an error. Try a different model.',
            'CONTENT_FILTERED': 'Content was filtered. Try adjusting your prompt.',
            'QUOTA_EXCEEDED': 'API quota exceeded.',
            'LIMIT_REACHED': 'Monthly generation limit reached. Upgrade your plan or buy credits.',
            'SUBSCRIPTION_INACTIVE': 'Your subscription is inactive. Please check your billing.',
            'SERVER_ERROR': 'Server error. Please try again later.',
            'EMPTY_RESPONSE': 'No response received from the API.',
            'PARSE_ERROR': 'Failed to parse API response.',
            'CANCELLED': 'Request was cancelled.',
            'UNKNOWN': 'An unexpected error occurred.'
        };
        return messages[this.code] || this.message || messages['UNKNOWN'];
    }
}

// ============================================
// API CLIENT CLASS
// ============================================
class APIClient {
    constructor(options = {}) {
        // Configuration
        this.baseUrl = options.baseUrl || 'https://openrouter.ai/api/v1';
        this.maxRetries = options.maxRetries ?? 3;
        this.timeout = options.timeout || 120000; // 2 minutes default
        this.maxConcurrent = options.maxConcurrent || 3;
        this.retryBaseDelay = options.retryBaseDelay || 1000;
        this.rateLimitDelay = options.rateLimitDelay || 500;

        // State
        this.activeRequests = 0;
        this.queue = [];
        this.cache = new Map();
        this.cacheMaxAge = options.cacheMaxAge || 5 * 60 * 1000; // 5 minutes
        this.abortControllers = new Map();

        // Stats
        this.stats = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            retriedRequests: 0,
            cachedResponses: 0
        };

        // Event callbacks
        this.onRequestStart = options.onRequestStart || null;
        this.onRequestEnd = options.onRequestEnd || null;
        this.onError = options.onError || null;

        // Cloud API key cache
        this._cloudApiKey = null;
        this._cloudApiKeyLoaded = false;

        // Usage limit cache (30 second TTL to avoid repeated API calls)
        this._cachedUsage = null;
        this._usageCacheTime = 0;
        this._usageCacheTTL = 30000; // 30 seconds

        // Proxy configuration
        this._proxyUrl = (typeof CONFIG !== 'undefined' && CONFIG.SUPABASE_URL)
            ? `${CONFIG.SUPABASE_URL}/functions/v1/generate-image`
            : 'https://rodzatuqkfqcdqgntdnd.supabase.co/functions/v1/generate-image';
        this._currentStudio = 'unknown';
    }

    /**
     * Set the current studio name for usage tracking
     */
    setStudio(studioName) {
        this._currentStudio = studioName;
    }

    // ========================================
    // API KEY MANAGEMENT
    // ========================================

    /**
     * Get API key - checks cloud key first if authenticated, falls back to localStorage
     */
    get apiKey() {
        // If cloud key is loaded and available, use it
        if (this._cloudApiKey) {
            return this._cloudApiKey;
        }
        // Fall back to localStorage
        return localStorage.getItem('openrouter_api_key') || '';
    }

    /**
     * Set API key in localStorage (and optionally sync to cloud)
     */
    set apiKey(key) {
        if (key) {
            localStorage.setItem('openrouter_api_key', key);
            // Sync to cloud if authenticated (non-blocking)
            this._syncApiKeyToCloud(key);
        } else {
            localStorage.removeItem('openrouter_api_key');
        }
    }

    hasApiKey() {
        return !!this.apiKey;
    }

    /**
     * Load API key from cloud (call after user signs in)
     * @returns {Promise<string|null>} The cloud API key or null
     */
    async loadCloudApiKey() {
        if (typeof ngSupabase === 'undefined' || !ngSupabase.isAuthenticated) {
            return null;
        }

        try {
            this._cloudApiKey = await ngSupabase.getApiKey('openrouter');
            this._cloudApiKeyLoaded = true;
            console.log('[API] Cloud API key loaded:', this._cloudApiKey ? 'yes' : 'no');
            return this._cloudApiKey;
        } catch (error) {
            console.warn('[API] Failed to load cloud API key:', error.message);
            return null;
        }
    }

    /**
     * Sync local API key to cloud storage (non-blocking)
     */
    async _syncApiKeyToCloud(key) {
        if (typeof ngSupabase === 'undefined' || !ngSupabase.isAuthenticated) {
            return;
        }

        try {
            await ngSupabase.saveApiKey('openrouter', key);
            this._cloudApiKey = key;
            console.log('[API] API key synced to cloud');
        } catch (error) {
            console.warn('[API] Failed to sync API key to cloud:', error.message);
        }
    }

    /**
     * Clear cloud API key cache (call on sign out)
     */
    clearCloudApiKey() {
        this._cloudApiKey = null;
        this._cloudApiKeyLoaded = false;
    }

    // ========================================
    // USAGE LIMIT CHECKING
    // ========================================

    /**
     * Check if user can proceed with generation based on usage limits
     * Shows upgrade modal or credits prompt if at limit
     * @returns {Promise<boolean>} true if can proceed, false if blocked
     */
    async _checkUsageLimit() {
        // Skip check for unauthenticated users (they use their own API key)
        if (typeof ngSupabase === 'undefined' || !ngSupabase.isAuthenticated) {
            return true;
        }

        try {
            // Get usage data (cached for 30 seconds)
            const usage = await this._getUsageWithCache();
            if (!usage) {
                // If we can't get usage, fail open (allow generation)
                return true;
            }

            // Free tier uses own API key - no limits
            if (usage.isUnlimited) {
                return true;
            }

            // Check if under limit
            if (usage.generationsUsed < usage.generationsLimit) {
                return true;
            }

            // At limit - check for credits first
            if (usage.creditsBalance > 0) {
                const useCredit = await SharedUI.showCreditsPrompt(usage.creditsBalance);
                if (useCredit) {
                    // TODO: Deduct credit via Supabase
                    // For now, allow the generation
                    return true;
                }
                return false;
            }

            // No credits - show upgrade modal
            const action = await SharedUI.showUpgradeModal(usage);
            // 'upgrade' navigates to pricing, 'cancel' blocks generation
            return false;

        } catch (error) {
            console.warn('[API] Usage check failed, allowing generation:', error.message);
            // Fail open - allow generation if usage check fails
            return true;
        }
    }

    /**
     * Get usage data with caching to avoid repeated API calls
     * @returns {Promise<Object|null>} Usage data or null
     */
    async _getUsageWithCache() {
        const now = Date.now();

        // Return cached usage if still valid
        if (this._cachedUsage && (now - this._usageCacheTime) < this._usageCacheTTL) {
            return this._cachedUsage;
        }

        // Fetch fresh usage data
        this._cachedUsage = await ngSupabase.getUsage();
        this._usageCacheTime = now;

        return this._cachedUsage;
    }

    /**
     * Show warning toast if approaching usage limit (80%+)
     * Only shows once per session
     */
    _checkUsageWarning() {
        if (!this._cachedUsage || this._cachedUsage.isUnlimited) {
            return;
        }

        const pct = (this._cachedUsage.generationsUsed / this._cachedUsage.generationsLimit) * 100;

        // Show warning at 80%+ usage, but only once per session
        if (pct >= 80 && !sessionStorage.getItem('ngraphics_usage_warning_shown')) {
            if (typeof SharedUI !== 'undefined' && SharedUI.showUsageWarning) {
                SharedUI.showUsageWarning(this._cachedUsage);
                sessionStorage.setItem('ngraphics_usage_warning_shown', 'true');
            }
        }
    }

    /**
     * Invalidate usage cache (call after generation to get fresh count)
     */
    invalidateUsageCache() {
        this._cachedUsage = null;
        this._usageCacheTime = 0;
    }

    // ========================================
    // PROXY ROUTING (PAID USERS)
    // ========================================

    /**
     * Check if current user can use the API
     * All users must be authenticated with a paid subscription
     * @returns {Promise<{canUse: boolean, reason?: string}>}
     */
    async _checkAccess() {
        // Must be authenticated
        if (typeof ngSupabase === 'undefined' || !ngSupabase.isAuthenticated) {
            return { canUse: false, reason: 'AUTH_REQUIRED' };
        }

        // Get usage data (includes tier info)
        const usage = await this._getUsageWithCache();
        if (!usage) {
            return { canUse: false, reason: 'USAGE_CHECK_FAILED' };
        }

        // Must have paid subscription
        if (usage.tier === 'free') {
            return { canUse: false, reason: 'SUBSCRIPTION_REQUIRED' };
        }

        return { canUse: true };
    }

    /**
     * Make request through edge function proxy
     * @param {Object} body - Request body for OpenRouter
     * @param {AbortSignal} signal - Abort signal
     * @returns {Promise<Response>}
     */
    async _makeProxyRequest(body, signal) {
        const accessToken = ngSupabase.session?.access_token;
        if (!accessToken) {
            throw new APIError('Not authenticated', 'AUTH_ERROR', { retryable: false });
        }

        const response = await fetch(this._proxyUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ...body,
                studio: this._currentStudio
            }),
            signal
        });

        return response;
    }

    // ========================================
    // HIGH-LEVEL API METHODS
    // ========================================

    /**
     * Generate an image using the specified model
     */
    async generateImage({
        model,
        prompt,
        images = [],
        seed = null,
        negativePrompt = null,
        aspectRatio = null,
        quality = null,
        style = null,
        requestId = null
    }) {
        const messages = this.buildImagePrompt(prompt, images);

        const body = {
            model,
            messages,
            modalities: ['image', 'text']
        };

        // Add optional parameters based on model capabilities
        if (seed !== null) body.seed = seed;
        if (negativePrompt) body.negative_prompt = negativePrompt;

        // Some models use different parameter names
        if (aspectRatio && aspectRatio !== 'auto') {
            body.aspect_ratio = aspectRatio;
        }

        if (quality) body.quality = quality;
        if (style) body.style = style;

        const result = await this.request('/chat/completions', body, { requestId });

        return {
            image: result.image,
            images: result.images || [result.image],
            text: result.text,
            seed: result.seed || seed,
            model
        };
    }

    /**
     * Analyze an image with vision model
     */
    async analyzeImage({
        image,
        prompt,
        model = 'google/gemini-2.0-flash-001',
        requestId = null
    }) {
        const messages = [{
            role: 'user',
            content: [
                {
                    type: 'image_url',
                    image_url: { url: image }
                },
                {
                    type: 'text',
                    text: prompt
                }
            ]
        }];

        const result = await this.request('/chat/completions', {
            model,
            messages
        }, { requestId });

        return {
            text: result.text,
            model
        };
    }

    /**
     * Generate text completion
     */
    async generateText({
        model = 'google/gemini-2.0-flash-001',
        prompt,
        systemPrompt = null,
        maxTokens = null,
        temperature = null,
        requestId = null
    }) {
        const messages = [];

        if (systemPrompt) {
            messages.push({ role: 'system', content: systemPrompt });
        }

        messages.push({ role: 'user', content: prompt });

        const body = { model, messages };
        if (maxTokens) body.max_tokens = maxTokens;
        if (temperature !== null) body.temperature = temperature;

        const result = await this.request('/chat/completions', body, { requestId });

        return {
            text: result.text,
            model
        };
    }

    /**
     * Generate multiple image variations in parallel
     */
    async generateVariations({
        model,
        prompt,
        images = [],
        count = 2,
        seeds = null,
        negativePrompt = null,
        aspectRatio = null,
        onProgress = null
    }) {
        const results = [];
        const errors = [];

        // Generate seeds if not provided
        const variationSeeds = seeds || Array.from(
            { length: count },
            () => Math.floor(Math.random() * 999999999)
        );

        // Create all requests
        const requests = variationSeeds.map((seed, index) =>
            this.generateImage({
                model,
                prompt,
                images,
                seed,
                negativePrompt,
                aspectRatio,
                requestId: `variation-${index}`
            })
            .then(result => {
                results.push({ index, ...result });
                if (onProgress) onProgress(results.length, count);
                return result;
            })
            .catch(err => {
                errors.push({ index, error: err });
                if (onProgress) onProgress(results.length, count);
                return null;
            })
        );

        await Promise.all(requests);

        // Sort by original index
        results.sort((a, b) => a.index - b.index);

        return {
            results: results.map(r => ({
                image: r.image,
                seed: r.seed,
                model: r.model
            })),
            errors,
            seeds: variationSeeds
        };
    }

    // ========================================
    // CORE REQUEST METHOD
    // ========================================
    async request(endpoint, body, options = {}) {
        const {
            requestId = null,
            cache = false,
            cacheTTL = this.cacheMaxAge,
            skipRetry = false
        } = options;

        // Check access - must be authenticated with paid subscription
        const access = await this._checkAccess();
        if (!access.canUse) {
            if (access.reason === 'AUTH_REQUIRED') {
                throw new APIError('Please sign in to generate images', 'AUTH_REQUIRED', { retryable: false });
            }
            if (access.reason === 'SUBSCRIPTION_REQUIRED') {
                throw new APIError('Subscription required to generate images', 'SUBSCRIPTION_REQUIRED', { retryable: false });
            }
            throw new APIError('Access denied', 'AUTH_ERROR', { retryable: false });
        }

        // Usage limits are handled by the edge function

        // Check cache
        if (cache) {
            const cacheKey = this.getCacheKey(endpoint, body);
            const cached = this.getFromCache(cacheKey);
            if (cached) {
                this.stats.cachedResponses++;
                return cached;
            }
        }

        // Wait for queue slot if at max concurrent
        await this.waitForSlot();

        this.activeRequests++;
        this.stats.totalRequests++;

        // Create abort controller for this request
        const controller = new AbortController();
        const reqId = requestId || `req-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        this.abortControllers.set(reqId, controller);

        // Notify request start
        if (this.onRequestStart) {
            this.onRequestStart({ requestId: reqId, endpoint, body });
        }

        let lastError;
        const maxAttempts = skipRetry ? 1 : this.maxRetries + 1;

        try {
            for (let attempt = 0; attempt < maxAttempts; attempt++) {
                try {
                    // Set up timeout
                    const timeoutId = setTimeout(() => {
                        controller.abort();
                    }, this.timeout);

                    // All requests go through edge function proxy
                    const response = await this._makeProxyRequest(body, controller.signal);

                    clearTimeout(timeoutId);

                    // Handle non-OK responses
                    if (!response.ok) {
                        const error = await this.parseErrorResponse(response);

                        // Retry if appropriate
                        if (error.retryable && attempt < maxAttempts - 1) {
                            this.stats.retriedRequests++;
                            const delay = this.getRetryDelay(attempt, error.retryAfter);
                            await this.delay(delay);
                            continue;
                        }

                        throw error;
                    }

                    // Parse and normalize response
                    const data = await response.json();
                    const result = this.normalizeResponse(data);

                    // Cache if requested
                    if (cache) {
                        const cacheKey = this.getCacheKey(endpoint, body);
                        this.setCache(cacheKey, result, cacheTTL);
                    }

                    this.stats.successfulRequests++;

                    // Invalidate usage cache and check for warning
                    this.invalidateUsageCache();
                    this._checkUsageWarning();

                    return result;

                } catch (err) {
                    lastError = err;

                    // Handle abort/timeout
                    if (err.name === 'AbortError') {
                        throw new APIError('Request timed out', 'TIMEOUT', { retryable: false });
                    }

                    // Handle network errors
                    if (err instanceof TypeError && err.message.includes('fetch')) {
                        lastError = new APIError('Network error', 'NETWORK_ERROR', {
                            retryable: true,
                            originalError: err
                        });
                    }

                    // Don't retry non-retryable errors
                    if (lastError instanceof APIError && !lastError.retryable) {
                        throw lastError;
                    }

                    // Retry with backoff
                    if (attempt < maxAttempts - 1) {
                        this.stats.retriedRequests++;
                        const delay = this.getRetryDelay(attempt);
                        await this.delay(delay);
                    }
                }
            }

            // All retries exhausted
            this.stats.failedRequests++;
            throw lastError;

        } finally {
            this.activeRequests--;
            this.abortControllers.delete(reqId);
            this.processQueue();

            if (this.onRequestEnd) {
                this.onRequestEnd({ requestId: reqId, success: !lastError });
            }
        }
    }

    // ========================================
    // RESPONSE NORMALIZATION
    // ========================================
    normalizeResponse(data) {
        // Check for API error in response
        if (data.error) {
            throw new APIError(
                data.error.message || 'API error',
                this.mapErrorCode(data.error.code || data.error.type),
                { retryable: false }
            );
        }

        const choice = data.choices?.[0];
        if (!choice) {
            throw new APIError('Empty response from API', 'EMPTY_RESPONSE');
        }

        const content = choice.message?.content;
        const result = { text: '', image: null, images: [] };

        // Handle array content (multimodal responses)
        if (Array.isArray(content)) {
            for (const part of content) {
                // Gemini inline_data format
                if (part.inline_data) {
                    const imageUrl = `data:${part.inline_data.mime_type};base64,${part.inline_data.data}`;
                    result.images.push(imageUrl);
                    if (!result.image) result.image = imageUrl;
                }
                // OpenAI image_url format
                else if (part.type === 'image_url' && part.image_url?.url) {
                    result.images.push(part.image_url.url);
                    if (!result.image) result.image = part.image_url.url;
                }
                // Text content
                else if (part.type === 'text' && part.text) {
                    result.text += part.text;
                }
                else if (typeof part === 'string') {
                    result.text += part;
                }
            }
        }
        // Handle string content
        else if (typeof content === 'string') {
            // Check if it's a base64 image
            if (content.startsWith('data:image')) {
                result.image = content;
                result.images.push(content);
            } else {
                result.text = content;
            }
        }

        // Handle DALL-E style response
        if (data.data?.[0]) {
            const imgData = data.data[0];
            if (imgData.b64_json) {
                result.image = `data:image/png;base64,${imgData.b64_json}`;
                result.images.push(result.image);
            } else if (imgData.url) {
                result.image = imgData.url;
                result.images.push(imgData.url);
            }
        }

        // Extract seed if present
        if (data.seed !== undefined) {
            result.seed = data.seed;
        }

        return result;
    }

    // ========================================
    // ERROR HANDLING
    // ========================================
    async parseErrorResponse(response) {
        let data = {};
        try {
            data = await response.json();
        } catch {
            // Ignore JSON parse errors
        }

        const status = response.status;
        const message = data.error?.message || `HTTP ${status}`;
        const code = this.getErrorCodeFromStatus(status, data);

        const error = new APIError(message, code, {
            status,
            retryable: [429, 500, 502, 503, 504].includes(status),
            retryAfter: this.parseRetryAfter(response.headers.get('Retry-After'))
        });

        return error;
    }

    getErrorCodeFromStatus(status, data = {}) {
        const errorType = data.error?.type || data.error?.code || '';
        const errorCode = data.code || '';

        // Handle proxy-specific error codes
        if (errorCode === 'SUBSCRIPTION_INACTIVE') return 'SUBSCRIPTION_INACTIVE';
        if (errorCode === 'LIMIT_REACHED') return 'LIMIT_REACHED';
        if (errorCode === 'AUTH_ERROR') return 'AUTH_ERROR';

        if (status === 401) return 'AUTH_REQUIRED';
        if (status === 403) return 'SUBSCRIPTION_REQUIRED';
        if (status === 429) return 'RATE_LIMITED';
        if (status === 400) {
            if (errorType.includes('content')) return 'CONTENT_FILTERED';
            return 'INVALID_REQUEST';
        }
        if (status === 402) return 'QUOTA_EXCEEDED';
        if (status >= 500) return 'SERVER_ERROR';

        return 'UNKNOWN';
    }

    mapErrorCode(code) {
        const mapping = {
            'invalid_api_key': 'AUTH_ERROR',
            'rate_limit_exceeded': 'RATE_LIMITED',
            'content_policy_violation': 'CONTENT_FILTERED',
            'invalid_request': 'INVALID_REQUEST',
            'model_not_found': 'MODEL_ERROR',
            'insufficient_quota': 'QUOTA_EXCEEDED'
        };
        return mapping[code] || 'UNKNOWN';
    }

    parseRetryAfter(header) {
        if (!header) return null;
        const seconds = parseInt(header, 10);
        return isNaN(seconds) ? null : seconds * 1000;
    }

    // ========================================
    // QUEUE MANAGEMENT
    // ========================================
    async waitForSlot() {
        if (this.activeRequests < this.maxConcurrent) {
            return;
        }

        return new Promise(resolve => {
            this.queue.push(resolve);
        });
    }

    processQueue() {
        if (this.queue.length > 0 && this.activeRequests < this.maxConcurrent) {
            const next = this.queue.shift();
            next();
        }
    }

    // ========================================
    // RETRY & TIMING
    // ========================================
    getRetryDelay(attempt, retryAfter = null) {
        if (retryAfter) {
            return retryAfter;
        }

        // Exponential backoff with jitter
        const base = this.retryBaseDelay;
        const exponential = base * Math.pow(2, attempt);
        const jitter = Math.random() * base;
        return Math.min(exponential + jitter, 30000);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // ========================================
    // CACHE MANAGEMENT
    // ========================================
    getCacheKey(endpoint, body) {
        return `${endpoint}:${JSON.stringify(body)}`;
    }

    getFromCache(key) {
        const entry = this.cache.get(key);
        if (!entry) return null;

        if (Date.now() > entry.expires) {
            this.cache.delete(key);
            return null;
        }

        return entry.data;
    }

    setCache(key, data, ttl) {
        this.cache.set(key, {
            data,
            expires: Date.now() + ttl
        });
    }

    clearCache() {
        this.cache.clear();
    }

    // ========================================
    // REQUEST MANAGEMENT
    // ========================================
    cancelRequest(requestId) {
        const controller = this.abortControllers.get(requestId);
        if (controller) {
            controller.abort();
            this.abortControllers.delete(requestId);
            return true;
        }
        return false;
    }

    cancelAllRequests() {
        for (const [id, controller] of this.abortControllers) {
            controller.abort();
        }
        this.abortControllers.clear();
        this.queue = [];
    }

    // ========================================
    // HELPERS
    // ========================================
    buildImagePrompt(prompt, images = []) {
        const content = [];

        // Add images first
        for (const image of images) {
            if (image) {
                content.push({
                    type: 'image_url',
                    image_url: { url: image }
                });
            }
        }

        // Add text prompt
        content.push({
            type: 'text',
            text: prompt
        });

        return [{
            role: 'user',
            content: content.length === 1 ? prompt : content
        }];
    }

    getStats() {
        return { ...this.stats };
    }

    resetStats() {
        this.stats = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            retriedRequests: 0,
            cachedResponses: 0
        };
    }
}

// ============================================
// SINGLETON INSTANCE
// ============================================
const api = new APIClient();

// ============================================
// CONVENIENCE FUNCTIONS
// ============================================

/**
 * Quick image generation
 */
async function generateImage(model, prompt, options = {}) {
    return api.generateImage({ model, prompt, ...options });
}

/**
 * Quick image analysis
 */
async function analyzeImage(image, prompt, options = {}) {
    return api.analyzeImage({ image, prompt, ...options });
}

/**
 * Quick text generation
 */
async function generateText(prompt, options = {}) {
    return api.generateText({ prompt, ...options });
}

// ============================================
// EXPORTS
// ============================================
window.APIClient = APIClient;
window.APIError = APIError;
window.api = api;
window.generateImage = generateImage;
window.analyzeImage = analyzeImage;
window.generateText = generateText;
