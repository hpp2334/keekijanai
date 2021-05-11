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
