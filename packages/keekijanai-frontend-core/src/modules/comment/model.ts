import { assert } from "@/utils/assert";
import { CommentVO } from "./data";

export interface CommentTreeContext {
  root: CommentTreeRoot;
}

const commentListGap = Symbol("CommentListGap");

export class CommentTreeRoot {
  private _roots: CommentTree[] = [];
  private _total = 0;
  private _nodeMap: Map<number, CommentTree> = new Map();
  private _query: {
    endCursor: number | null;
    hasUnloadRoots: boolean;
  } = {
    endCursor: null,
    hasUnloadRoots: false,
  };

  public get roots() {
    return this._roots;
  }

  public get total() {
    return this._total;
  }

  public set total(total: number) {
    this.total = total;
  }

  public get paginationQuery() {
    return this._query;
  }

  public set endCursor(cursor: number | null) {
    this._query.endCursor = cursor;
  }

  public set hasUnloadRoots(hasUnloadRoots: boolean) {
    this._query.hasUnloadRoots = hasUnloadRoots;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  public getById(id: number): CommentTree | null {
    return this._nodeMap.get(id) ?? null;
  }

  public append(comment: CommentTree, parent: CommentTree | null) {
    this._nodeMap.set(comment.id, comment);
    if (parent) {
      parent._append(comment);
    } else {
      this._appendInRoots(comment);
    }
    this._total += 1;
  }

  public remove(comment: CommentTree) {
    const parent = comment.parent;
    if (parent) {
      parent._removeChild(comment);
    } else {
      this._removeFromRoots(comment);
    }
    this._total -= 1;
  }

  public destroy() {
    for (const root of this._roots) {
      root.destroy();
    }
    this._roots.splice(0, this._roots.length);
  }

  private _appendInRoots(comment: CommentTree) {
    this._roots.push(comment);
  }
  private _removeFromRoots(comment: CommentTree) {
    const index = this._roots.findIndex((target) => target.id === comment.id);
    if (index >= 0) {
      this._roots.splice(index, 1);
    }
  }

  public static create() {
    const instance = new CommentTreeRoot();
    return instance;
  }
}

export class CommentTree {
  private _native: CommentVO;
  private _cursor: number | null;
  private _children: CommentTree[];
  private _childrenLength: number;
  private _query: {
    forwardEndCursor: number | null;
    hasUnloadForwardChildren: boolean;
    backwardEndCursor: number | null;
    hasUnloadBackwardChildren: boolean;
  };
  private _ctx: CommentTreeContext;

  private constructor(ctx: CommentTreeContext, native: CommentVO, cursor: number) {
    this._native = native;
    this._cursor = cursor;
    this._children = [];
    this._childrenLength = 0;
    this._query = {
      forwardEndCursor: null,
      hasUnloadForwardChildren: false,
      backwardEndCursor: null,
      hasUnloadBackwardChildren: false,
    };
    this._ctx = ctx;
  }

  public get id() {
    return this._native.id;
  }

  public get childrenLength() {
    return this._childrenLength;
  }

  public get isRoot() {
    return this.parent === null;
  }

  public get data() {
    return this._native;
  }

  public get children(): CommentTree[] {
    return this._children;
  }

  public set cursor(cursor: number) {
    this._cursor = cursor;
  }

  public get cursor() {
    assert(this._cursor, "cursor is null");
    return this._cursor;
  }

  public get paginationQuery() {
    return this._query;
  }

  public get parent(): CommentTree | null {
    const parentId = this.data.parent_id;
    if (parentId === null) {
      return null;
    }
    return this._ctx.root.getById(parentId);
  }

  public replaceChildren(children: CommentTree[]) {
    this.children.splice(0, this.children.length, ...children);
  }

  public append(instance: CommentTree) {
    this._ctx.root.append(instance, this);
  }

  public removeChild(instance: CommentTree) {
    this._ctx.root.remove(instance);
  }

  public destroy() {
    for (const child of this._children) {
      child.destroy();
    }
    this._children.splice(0, this._children.length);
  }

  public _removeChild(child: CommentTree) {
    const index = this._children.findIndex((target) => target.id === child.id);
    if (index >= 0) {
      this._children.splice(index, 1);
      this.data.child_count -= 1;
    }
  }

  public _append(instance: CommentTree) {
    this.data.child_count += 1;
    this._children.push(instance);
    this._childrenLength += 1;
  }

  public static create(ctx: CommentTreeContext, native: CommentVO, cursor: number) {
    const instance = new CommentTree(ctx, native, cursor);
    return instance;
  }
}
