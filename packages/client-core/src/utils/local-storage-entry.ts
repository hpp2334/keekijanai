const localStorageMemory = require('localstorage-memory');

// FOR SSR
const localStorage = typeof window === 'undefined' ? localStorageMemory : window.localStorage;

export function createLocalStorageEntry(key: string) {
  const exports = {
    setItem: (value: string) => {
      return localStorage.setItem(key, value);
    },
    getItem: () => {
      return localStorage.getItem(key);
    },
    removeItem: () => {
      return localStorage.removeItem(key);
    },
  };
  return exports;
}
