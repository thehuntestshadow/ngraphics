/**
 * Vitest Test Setup
 * Provides browser-like environment for testing
 */

import { vi } from 'vitest';

// Mock localStorage
const localStorageMock = {
    store: {},
    getItem: (key) => localStorageMock.store[key] || null,
    setItem: (key, value) => { localStorageMock.store[key] = String(value); },
    removeItem: (key) => { delete localStorageMock.store[key]; },
    clear: () => { localStorageMock.store = {}; },
    get length() { return Object.keys(localStorageMock.store).length; },
    key: (i) => Object.keys(localStorageMock.store)[i] || null
};

Object.defineProperty(globalThis, 'localStorage', {
    value: localStorageMock,
    writable: true
});

// Mock fetch
globalThis.fetch = vi.fn();

// Reset mocks before each test
beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
});
