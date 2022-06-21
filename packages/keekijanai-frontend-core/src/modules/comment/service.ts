/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { assert } from "@/utils/assert";
import { switchTap } from "@/utils/rxjs-helper";
import { noop } from "@/utils/common";
import { BehaviorSubject, Observable } from "rxjs";
import { AuthService } from "../auth";
import { CommentApi } from "./api";
import * as Data from "./data";
import { container } from "@/core/container";
import { Service, ServiceFactory, setServiceFactory } from "@/core/service";
import { CommentTree, CommentTreeContext, CommentTreeRoot } from "./model";
import { CursorDirection, CursorPaginationListItem } from "@/vos";

function mergeCommentsInRoot(
  root: CommentTreeRoot,
  params: {
    cursorItemComments: CursorPaginationListItem<Data.CommentVO, number>[];
    hasMore: boolean;
    endCursor: number | null;
    total?: number;
  }
) {
  root.endCursor = params.endCursor;
  root.hasUnloadRoots = params.hasMore;
  if (params.total !== undefined) {
    root.total = params.total;
  }

  const ctx: CommentTreeContext = {
    root,
  };
  params.cursorItemComments.forEach((item) => {
    const vo = item.payload;
    if (vo.parent_id !== null && !root.getById(vo.parent_id)) {
      return;
    }
    const comment = CommentTree.create(ctx, vo, item.cursor);
    const parent = vo.parent_id === null ? null : root.getById(vo.parent_id);
    root.append(comment, parent);
  });
}

export class CommentService implements Service {
  private rootsLimit: number;
  private leavesLimit: number;
  private _commentTreeContext: CommentTreeContext | null = null;

  public commentTreeRoot$ = new BehaviorSubject<CommentTreeRoot | null>(null);

  private get commentTreeContext(): CommentTreeContext {
    assert(this._commentTreeContext !== null, "should call initializeTree first");
    return this._commentTreeContext;
  }

  private get commentTreeRoot(): CommentTreeRoot {
    const tree = this.commentTreeRoot$.value;
    assert(tree, 'tree is null. "initializeTree" should be call first');
    return tree;
  }

  public constructor(private authService: AuthService, private api: CommentApi, public belong: string) {
    this.rootsLimit = 20;
    this.leavesLimit = 15;
  }

  public destroy() {
    this.commentTreeRoot$.next(null);
  }

  public initializeTree(): Observable<unknown> {
    this.commentTreeRoot$.next(null);
    return this.api
      .getTree({
        belong: this.belong,
        roots_limit: this.rootsLimit,
        leaves_limit: this.leavesLimit,
        cursor_id: null,
      })
      .pipe(
        switchTap((resp) => {
          const payload = resp.data.payload;

          const root = CommentTreeRoot.create();
          this._commentTreeContext = {
            root,
          };
          mergeCommentsInRoot(root, {
            cursorItemComments: payload.list,
            hasMore: payload.has_more,
            endCursor: payload.end_cursor,
            total: payload.left_total,
          });

          this.commentTreeRoot$.next(root);
        })
      );
  }

  public loadMoreTree(): Observable<unknown> {
    const root = this.commentTreeRoot;
    return this.api
      .getTree({
        belong: this.belong,
        roots_limit: this.rootsLimit,
        leaves_limit: this.leavesLimit,
        cursor_id: root.endCursor,
      })
      .pipe(
        switchTap((resp) => {
          const payload = resp.data.payload;

          mergeCommentsInRoot(root, {
            cursorItemComments: payload.list,
            hasMore: payload.has_more,
            endCursor: payload.end_cursor,
          });

          this.commentTreeRoot$.next(root);
        })
      );
  }

  public create(
    payload: { content: string },
    reference: CommentTree | null,
    parent: CommentTree | null
  ): Observable<unknown> {
    const root = this.commentTreeRoot;
    const toCreate: Data.CommentCreateVO = {
      belong: this.belong,
      content: payload.content,
      reference_id: reference?.id ?? null,
      parent_id: parent?.id ?? null,
    };
    return this.api
      .create({
        payload: toCreate,
      })
      .pipe(
        switchTap((resp) => {
          const { payload, cursor } = resp.data.payload;
          const comment = CommentTree.create(this.commentTreeContext, payload, cursor);
          root.append(comment, parent);

          this.commentTreeRoot$.next(root);
        })
      );
  }

  public remove(comment: CommentTree): Observable<unknown> {
    const root = this.commentTreeRoot;
    return this.api.remove(comment.id).pipe(
      switchTap(() => {
        root.remove(comment);

        this.commentTreeRoot$.next(root);
      })
    );
  }

  public loadLeaves(
    parent: CommentTree,
    params: {
      cursorDirection?: CursorDirection;
      cursorId?: number;
    } = {}
  ): Observable<unknown> {
    const root = this.commentTreeRoot;
    const normalizedParams = {
      cursorDirection: params.cursorDirection ?? CursorDirection.Forward,
      cursorId: params.cursorId ?? null,
    };

    return this.api
      .list({
        belong: this.belong,
        limit: this.leavesLimit,
        parent_id: parent.id,
        cursor_id: normalizedParams.cursorId,
        cursor_direction: normalizedParams.cursorDirection,
      })
      .pipe(
        switchTap((resp) => {
          const incomingChildren = resp.data.payload.list.map((item) =>
            CommentTree.create({ root }, item.payload, item.cursor)
          );
          parent.replaceChildren(incomingChildren);

          if (normalizedParams.cursorDirection === CursorDirection.Forward) {
            parent.paginationQuery.forwardEndCursor = resp.data.payload.end_cursor;
            parent.paginationQuery.hasUnloadForwardChildren = resp.data.payload.has_more;
          } else {
            parent.paginationQuery.forwardEndCursor = resp.data.payload.end_cursor;
            parent.paginationQuery.hasUnloadBackwardChildren = resp.data.payload.has_more;
          }

          this.commentTreeRoot$.next(root);
        })
      );
  }

  public loadMoreLeaves(
    parent: CommentTree,
    params: {
      cursorDirection?: CursorDirection;
    } = {}
  ): Observable<unknown> {
    const root = this.commentTreeRoot;
    const paramCursorDirection = params.cursorDirection ?? CursorDirection.Forward;

    return this.api
      .list({
        belong: this.belong,
        limit: this.leavesLimit,
        parent_id: parent.id,
        cursor_id: paramCursorDirection === CursorDirection.Forward ? this.commentTreeRoot.endCursor : null,
        cursor_direction: paramCursorDirection,
      })
      .pipe(
        switchTap((resp) => {
          const currentChildren = [...parent.children];
          const incomingChildren = resp.data.payload.list.map((item) =>
            CommentTree.create({ root }, item.payload, item.cursor)
          );

          if (paramCursorDirection === CursorDirection.Forward) {
            parent.replaceChildren([...currentChildren, ...incomingChildren]);
          } else {
            parent.replaceChildren([...incomingChildren, ...currentChildren]);
          }
          if (paramCursorDirection === CursorDirection.Forward) {
            parent.paginationQuery.forwardEndCursor = resp.data.payload.end_cursor;
            parent.paginationQuery.hasUnloadForwardChildren = resp.data.payload.has_more;
          } else {
            parent.paginationQuery.forwardEndCursor = resp.data.payload.end_cursor;
            parent.paginationQuery.hasUnloadBackwardChildren = resp.data.payload.has_more;
          }

          this.commentTreeRoot$.next(root);
        })
      );
  }
}

export class CommentServiceFactory implements ServiceFactory<[string], CommentService> {
  public constructor(private authService: AuthService, private api: CommentApi) {}

  public factory(belong: string) {
    const service = new CommentService(this.authService, this.api, belong);
    service.initializeTree().subscribe(noop);
    return service;
  }
}

setServiceFactory(CommentServiceFactory);
container.register({
  class: CommentServiceFactory,
  constructorArgClasses: [AuthService, CommentApi],
});
