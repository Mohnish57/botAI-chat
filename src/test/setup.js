import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// jsdom's localStorage can be incomplete across versions, so install a small,
// spec-faithful in-memory implementation to keep persistence tests deterministic.
function createStorageMock() {
  let store = {};
  return {
    getItem: (key) => (key in store ? store[key] : null),
    setItem: (key, value) => {
      store[key] = String(value);
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    key: (i) => Object.keys(store)[i] ?? null,
    get length() {
      return Object.keys(store).length;
    },
  };
}

vi.stubGlobal('localStorage', createStorageMock());

// jsdom has no matchMedia. Provide one that resolves min-/max-width queries
// against a desktop viewport (1280px) so MUI renders the permanent sidebar.
vi.stubGlobal('matchMedia', (query) => {
  const width = 1280;
  const min = query.match(/min-width:\s*(\d+)/);
  const max = query.match(/max-width:\s*(\d+)/);
  let matches = true;
  if (min) matches = width >= Number(min[1]);
  if (max) matches = matches && width <= Number(max[1]);
  return {
    matches,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  };
});

// Keep tests isolated: unmount React trees and reset persisted state.
beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  cleanup();
  localStorage.clear();
});
