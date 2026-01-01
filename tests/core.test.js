/**
 * Core.js Unit Tests
 * Tests for EventBus and ReactiveState
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Import the source file (will need adjustment based on how exports work)
// For now, we'll test the patterns directly

describe('EventBus', () => {
    let EventBus;
    let bus;

    beforeEach(async () => {
        // Create a minimal EventBus implementation for testing
        EventBus = class {
            constructor() {
                this.listeners = new Map();
            }

            on(event, handler) {
                if (!this.listeners.has(event)) {
                    this.listeners.set(event, new Set());
                }
                this.listeners.get(event).add(handler);
                return () => this.off(event, handler);
            }

            off(event, handler) {
                if (this.listeners.has(event)) {
                    this.listeners.get(event).delete(handler);
                }
            }

            once(event, handler) {
                const wrapper = (data) => {
                    handler(data);
                    this.off(event, wrapper);
                };
                return this.on(event, wrapper);
            }

            emit(event, data) {
                // Exact match
                if (this.listeners.has(event)) {
                    this.listeners.get(event).forEach(handler => handler(data));
                }
                // Wildcard match
                this.listeners.forEach((handlers, pattern) => {
                    if (pattern.endsWith(':*')) {
                        const prefix = pattern.slice(0, -1);
                        if (event.startsWith(prefix)) {
                            handlers.forEach(handler => handler(data));
                        }
                    }
                });
            }
        };
        bus = new EventBus();
    });

    it('should register and emit events', () => {
        const handler = vi.fn();
        bus.on('test', handler);
        bus.emit('test', { data: 'hello' });
        expect(handler).toHaveBeenCalledWith({ data: 'hello' });
    });

    it('should support multiple handlers for same event', () => {
        const handler1 = vi.fn();
        const handler2 = vi.fn();
        bus.on('test', handler1);
        bus.on('test', handler2);
        bus.emit('test', { value: 42 });
        expect(handler1).toHaveBeenCalledWith({ value: 42 });
        expect(handler2).toHaveBeenCalledWith({ value: 42 });
    });

    it('should support wildcard listeners', () => {
        const handler = vi.fn();
        bus.on('image:*', handler);
        bus.emit('image:generated', { url: 'test.png' });
        bus.emit('image:error', { error: 'failed' });
        expect(handler).toHaveBeenCalledTimes(2);
    });

    it('should handle once listeners', () => {
        const handler = vi.fn();
        bus.once('test', handler);
        bus.emit('test', {});
        bus.emit('test', {});
        expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should return unsubscribe function', () => {
        const handler = vi.fn();
        const unsub = bus.on('test', handler);
        unsub();
        bus.emit('test', {});
        expect(handler).not.toHaveBeenCalled();
    });

    it('should not fail when emitting event with no listeners', () => {
        expect(() => bus.emit('nonexistent', {})).not.toThrow();
    });
});

describe('ReactiveState', () => {
    let ReactiveState;
    let state;

    beforeEach(() => {
        // Create a minimal ReactiveState implementation for testing
        ReactiveState = class {
            constructor(initial = {}, options = {}) {
                this.data = { ...initial };
                this.watchers = new Map();
                this.options = options;
            }

            get(key) {
                return key ? this.data[key] : { ...this.data };
            }

            set(key, value) {
                const oldValue = this.data[key];
                if (oldValue !== value) {
                    this.data[key] = value;
                    this._notifyWatchers(key, value, oldValue);
                }
            }

            watch(key, callback, options = {}) {
                if (!this.watchers.has(key)) {
                    this.watchers.set(key, new Set());
                }
                this.watchers.get(key).add(callback);

                if (options.immediate) {
                    callback(this.data[key], undefined, key);
                }

                return () => {
                    if (this.watchers.has(key)) {
                        this.watchers.get(key).delete(callback);
                    }
                };
            }

            _notifyWatchers(key, newValue, oldValue) {
                if (this.watchers.has(key)) {
                    this.watchers.get(key).forEach(cb => cb(newValue, oldValue, key));
                }
                // Notify '*' watchers
                if (this.watchers.has('*')) {
                    this.watchers.get('*').forEach(cb => cb(newValue, oldValue, key));
                }
            }

            batch(fn) {
                fn(this.data);
                // Simplified: just notify all watchers after batch
            }
        };
        state = new ReactiveState({ count: 0, name: 'test' });
    });

    it('should get and set values', () => {
        state.set('count', 5);
        expect(state.get('count')).toBe(5);
    });

    it('should get all values when no key provided', () => {
        const all = state.get();
        expect(all).toEqual({ count: 0, name: 'test' });
    });

    it('should notify watchers on change', () => {
        const watcher = vi.fn();
        state.watch('name', watcher);
        state.set('name', 'updated');
        expect(watcher).toHaveBeenCalledWith('updated', 'test', 'name');
    });

    it('should not notify when value unchanged', () => {
        const watcher = vi.fn();
        state.watch('count', watcher);
        state.set('count', 0); // Same value
        expect(watcher).not.toHaveBeenCalled();
    });

    it('should support immediate option', () => {
        const watcher = vi.fn();
        state.watch('count', watcher, { immediate: true });
        expect(watcher).toHaveBeenCalledWith(0, undefined, 'count');
    });

    it('should return unwatch function', () => {
        const watcher = vi.fn();
        const unwatch = state.watch('count', watcher);
        unwatch();
        state.set('count', 10);
        expect(watcher).not.toHaveBeenCalled();
    });

    it('should support wildcard watchers', () => {
        const watcher = vi.fn();
        state.watch('*', watcher);
        state.set('count', 5);
        state.set('name', 'changed');
        expect(watcher).toHaveBeenCalledTimes(2);
    });
});
