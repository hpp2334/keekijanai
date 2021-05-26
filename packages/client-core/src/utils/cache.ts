import LRU from 'lru-cache';

export type Cache = LRU<string, any>;

export class CacheManager {
  private _cacheMap = new Map<string, Cache>();
  /** if cache already exists, return it. Otherwise, create a cache with "size" and "maxAge"
   * then return it
   */
  get(scope: string, size?: number, maxAge?: number) {
    let cache = this._cacheMap.get(scope);
    if (!cache) {
      size = size ?? 50;
      maxAge = maxAge ?? 1000 * 60 * 60;
      this._cacheMap.set(scope, cache = new LRU({
        max: size,
        maxAge: maxAge,
      }));
    }
    return cache;
  }
  has(scope: string) {
    return this._cacheMap.has(scope);
  }
  delete(scope: string) {
    this._cacheMap.delete(scope);
  }
}
