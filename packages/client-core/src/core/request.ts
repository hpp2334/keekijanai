import { ajax } from 'rxjs/ajax';
import { Client } from "./client";
import _ from 'lodash';
import { of, Subject, Subscription } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { TreeMap, TreeNode } from 'jelly-util-tree-map';
import { SyncSeriesHook } from '../utils/browser-hook';

interface RequestParam {
  route: string;
  query?: {};
  method?: string;
  body?: any;
  cache?: {
    type?: 'cache';
    paths: string[];
  } | {
    type: 'remove';
    paths: string[];
  }
}

export class Requester {
  private returnedSubjectMap = new Map<string, Subject<any>>();
  private internalRequestMap = new Map<string, Subscription>();
  private _treeCache: TreeMap | undefined;

  public hooks = {
    beforeRequest: new SyncSeriesHook<[any]>(),
  }

  get treeCache() {
    return this._treeCache ?? (this._treeCache = new TreeMap())
  }

  constructor(private client: Client) {}

  getURI(params: RequestParam) {
    const unfilteredQueryObject = {
      ...params.query || {},
      __route__: params.route,
    };
    const queryObject = _.pickBy(unfilteredQueryObject, x => x !== undefined);

    return this.client.config.route.root
      + '?'
      + new URLSearchParams(queryObject);
  }
  
  request(params: RequestParam) {
    let { method = 'GET', body, cache: cacheOpts } = params;
    
    if (cacheOpts) {
      cacheOpts.type = cacheOpts.type === undefined ? 'cache' : cacheOpts.type;
    }
    method = method.toUpperCase();

    const headers = {};
    this.hooks.beforeRequest.call(headers);

    const url = this.getURI(params);
    
    const obKey = JSON.stringify({ method, url, headers });

    let cacheNode: TreeNode<any> | undefined;
    if (cacheOpts) {
      cacheNode = this.treeCache.root.access(cacheOpts.paths, true);
      if (cacheOpts.type === 'cache' && cacheNode?.hasValue()) {
        return of(cacheNode.getValue());
      }
    }

    let returnedSubject = this.returnedSubjectMap.get(obKey);
    if (returnedSubject) {
      const subscription = this.internalRequestMap.get(obKey);

      if (!subscription) {
        throw Error("no internal request object found. It's a bug.");
      }
      subscription.unsubscribe();
      this.internalRequestMap.delete(obKey);
      if (method !== 'GET') {
        returnedSubject.error(new Error('cancel'));
        this.returnedSubjectMap.delete(obKey);
        returnedSubject = undefined;
      }
    }

    const subject = returnedSubject ?? new Subject();
    const subscription = ajax<any>({
      method,
      headers,
      url,
      body
    }).pipe(
      map(value => value.response),
      tap(value => {
        if (cacheOpts) {
          switch (cacheOpts.type) {
            case 'cache':
              cacheNode?.setValue(value);
              break;
            case 'remove':
              cacheNode?.deleteValue();
              break;
            default:
              throw Error("not support type");
          }
        }
      })
    ).subscribe({
      error: err => {
        this.internalRequestMap.delete(obKey);
        this.returnedSubjectMap.delete(obKey);
        subject.error(err);
      },
      next: (value) => {
        subject.next(value);
      },
      complete: () => {
        this.internalRequestMap.delete(obKey);
        this.returnedSubjectMap.delete(obKey);
        subject.complete();
      },
    });
    this.internalRequestMap.set(obKey, subscription);
    this.returnedSubjectMap.set(obKey, subject);
    return subject;
  }
}
