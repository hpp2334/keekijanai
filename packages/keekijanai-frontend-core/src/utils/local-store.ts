import { isNil } from "@/utils/common";
import * as localStorageMemory from "localstorage-memory";
import { noop } from "./common";

interface LocalStoreEntryOptions {
  // ttl in ms
  ttl?: number;
}

interface InternalSchema<T> {
  payload: T;
  expire: number | null;
}

const dummyLocalStorage = (() => {
  const container = new Map<any, any>();

  const ret: Storage = {
    get length() {
      return container.size;
    },
    clear: () => {
      container.clear();
    },
    getItem: (key) => {
      return container.get(key) ?? null;
    },
    setItem: (key, value) => {
      container.set(key, value);
    },
    key: (index) => {
      return [...container.keys()][index] ?? null;
    },
    removeItem: (key) => {
      container.delete(key);
    },
  };
  return ret;
})();

const now = () => Date.now();
const localStorage = typeof window !== "undefined" ? window.localStorage : dummyLocalStorage;

export const LocalStoreEntryKey = (key: string) => "keekijanai-local-store/" + key;

export class LocalStoreEntry<T> {
  public constructor(private key: string, private opts?: LocalStoreEntryOptions) {}

  public get(): T | null {
    const encoded = localStorage.getItem(this.key);
    console.debug("[localStore]", "get-encoded", { key: this.key, encoded });
    if (encoded === null) {
      return null;
    }
    const value = this.decode(encoded);
    if (value.expire !== null && value.expire <= now()) {
      return null;
    }
    return value.payload;
  }

  public set(value: T): void {
    const ttl = this.opts?.ttl;

    const payload: InternalSchema<T> = {
      payload: value,
      expire: isNil(ttl) ? null : now() + ttl,
    };
    const encoded = this.encode(payload);
    console.debug("[localStore]", "set-encoded", { key: this.key, encoded });
    localStorage.setItem(this.key, encoded);
  }

  public delete(): void {
    console.debug("[localStore]", "delete", { key: this.key });
    localStorage.removeItem(this.key);
  }

  private encode(value: InternalSchema<T>) {
    // VERSION + PAYLOAD
    return "0001" + JSON.stringify(value);
  }

  private decode(encoded: string): InternalSchema<T> {
    encoded = encoded.slice("0001".length);
    const value: InternalSchema<T> = JSON.parse(encoded);
    return value;
  }
}
