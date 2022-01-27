import { CursorPagination } from "@/generated/keekijanai-api";
import { assert } from "@/utils/assert";
import { switchTap } from "@/utils/rxjs-helper";
import { omit, noop } from "lodash-es";
import { BehaviorSubject, catchError, Observable, of, switchMap, switchMapTo } from "rxjs";
import { injectable } from "tsyringe";
import { AuthService, UserRole } from "../auth";
import { CommentApi } from "./api";
import * as Data from "./data";

const DEFAULT_PAGINATION = {
  limit: 0,
  cursor: null,
  total: 0,
  has_more: false,
};

@injectable()
export class CommentService {
  private rootsLimit: number;
  private leavesLimit: number;

  public belong!: string;
  public commentTree$: BehaviorSubject<Data.CommentTree | null>;
  private idMapComment: Map<number, Data.TreeComment>;

  public constructor(private authService: AuthService, private api: CommentApi) {
    this.commentTree$ = new BehaviorSubject<Data.CommentTree | null>(null);
    this.idMapComment = new Map();

    this.rootsLimit = 20;
    this.leavesLimit = 15;
  }

  public initialize(belong: string) {
    this.belong = belong;

    this.updateTree().subscribe(noop);
    this.authService.current$.subscribe(() => {
      const ct = this.commentTree$.value;
      if (ct) {
        this.commentTree$.next({ ...ct });
      }
    });
  }

  public updateTree(): Observable<unknown> {
    this.commentTree$.next(null);
    this.idMapComment.clear();
    return this.api
      .getTree({
        belong: this.belong,
        roots_limit: this.rootsLimit,
        leaves_limit: this.leavesLimit,
        cursor: null,
      })
      .pipe(
        switchTap((resp) => {
          this.mergeCommentTree(resp.data.comments, resp.data.pagination);
        })
      );
  }

  public create(payload: { content: string }, reference: Data.TreeComment | null): Observable<unknown> {
    const toCreate: Data.CommentToCreate = {
      belong: this.belong,
      content: payload.content,
      reference_id: reference?.id,
      parent_id:
        reference === null ? Data.NONE_ROOT_PARENT_ID : reference.parent === null ? reference.id : reference.parent.id,
    };
    return this.api
      .create({
        payload: toCreate,
      })
      .pipe(
        switchTap((resp) => {
          const payload = resp.data.payload;
          this.insertIntoCommentTree(payload);
        })
      );
  }

  public remove(id: number): Observable<unknown> {
    return this.api.remove(id).pipe(
      switchTap(() => {
        const commentTree = this.commentTree$.value;
        if (commentTree === null) {
          return;
        }

        const comment = this.idMapComment.get(id) ?? null;
        if (!comment) {
          return;
        }

        this.idMapComment.delete(id);
        commentTree.data = [...commentTree.data];
        comment.children.data.forEach((tc) => {
          this.idMapComment.delete(tc.id);
        });

        const parent = comment.parent;
        if (!parent) {
          const index = commentTree.data.findIndex((comment) => comment.id === id);
          if (index >= 0) {
            commentTree.data.splice(index, 1);
            commentTree.pagination.total -= 1;
          }
        } else {
          const index = parent.children.data.findIndex((comment) => comment.id === id);
          parent.children.data.splice(index, 1);
          parent.child_count -= 1;
          parent.children.pagination.total -= 1;
        }
        this.commentTree$.next({ ...commentTree });
      })
    );
  }

  public loadMoreRoot(): Observable<unknown> {
    const ct = this.commentTree$.value;
    assert(ct, "comment tree is null");

    return this.api
      .getTree({
        belong: this.belong,
        roots_limit: this.rootsLimit,
        leaves_limit: this.leavesLimit,
        cursor: ct.pagination.cursor,
      })
      .pipe(
        switchTap((resp) => {
          this.mergeCommentTree(resp.data.comments, resp.data.pagination);
        })
      );
  }

  public loadMoreLeaves(comment: Data.TreeComment): Observable<unknown> {
    return this.api
      .list({
        belong: this.belong,
        limit: this.leavesLimit,
        cursor: comment.children.pagination.cursor ?? undefined,
        parent_id: comment.id,
      })
      .pipe(
        switchTap((resp) => {
          const ct = this.commentTree$.value;
          assert(ct, "comment tree is null");

          const treeComments = resp.data.comments.map((comment) => CommentService.buildInitialTreeComment(comment));
          treeComments.forEach((tc) => (tc.parent = comment));
          comment.children.data.push(...treeComments);
          comment.children.pagination = {
            ...resp.data.pagination,
            cursor: treeComments[treeComments.length - 1].id ?? null,
          };
          this.commentTree$.next({ ...ct });
        })
      );
  }

  private mergeCommentTree(comments: Data.StyledCommentVO[], pagination: CursorPagination) {
    const prevCt = this.commentTree$.value;
    const [ct, map] = CommentService.buildCommentTree(comments, pagination);
    if (prevCt) {
      ct.data.splice(0, 0, ...prevCt.data);
    }
    this.commentTree$.next(ct);
    for (const [key, value] of map) {
      this.idMapComment.set(key, value);
    }
  }

  private insertIntoCommentTree(comment: Data.StyledCommentVO) {
    const commentTree = this.commentTree$.value;
    const _created = comment;
    if (commentTree === null) {
      return;
    }
    if (_created.id !== Data.NONE_ROOT_PARENT_ID && this.idMapComment.has(_created.id)) {
      return;
    }

    const parent = this.idMapComment.get(_created.parent_id) ?? null;
    const created = CommentService.buildInitialTreeComment(_created);
    created.parent = parent;

    commentTree.data = [...commentTree.data];
    this.idMapComment.set(created.id, created);
    if (parent === null) {
      commentTree.data.unshift(created);
      commentTree.pagination.total += 1;
    } else {
      const pagination = parent.children.pagination;
      parent.child_count += 1;
      parent.children.data = [created, ...parent.children.data];
      pagination.total += 1;
      if (pagination.cursor === null) {
        pagination.cursor = created.id;
      }
    }
    this.commentTree$.next({ ...commentTree });
  }

  public canRemove(comment: { user_id: number }) {
    const current = this.authService.current$.value;
    return current?.role === UserRole.Admin || current?.id === comment.user_id;
  }

  public static buildInitialTreeComment(comment: Data.StyledCommentVO): Data.TreeComment {
    return {
      ...omit(comment, ["parent_id"]),
      parent: null,
      children: {
        data: [],
        pagination: DEFAULT_PAGINATION,
      },
    };
  }

  public static buildCommentTree(
    data: Data.StyledCommentVO[],
    pagination: CursorPagination
  ): [Data.CommentTree, Map<number, Data.TreeComment>] {
    const map: Map<number, Data.TreeComment> = new Map();
    const roots = data
      .filter((comment) => comment.parent_id === Data.NONE_ROOT_PARENT_ID)
      .map(CommentService.buildInitialTreeComment);
    roots.forEach((tc) => map.set(tc.id, tc));

    data
      .filter((comment) => comment.parent_id !== Data.NONE_ROOT_PARENT_ID)
      .forEach((comment) => {
        const parent = map.get(comment.parent_id);
        if (!parent) {
          // Dirty data, don't return it
          return;
        }
        const tc = CommentService.buildInitialTreeComment(comment);
        tc.parent = parent;
        parent.children.data.push(tc);
        map.set(tc.id, tc);
      });

    roots.forEach((tc) => {
      const data = tc.children.data;

      tc.children.pagination = {
        cursor: data.length > 0 ? data[data.length - 1].id : null,
        total: data.length,
        limit: data.length,
        has_more: tc.child_count > data.length,
      };
    });

    return [
      {
        data: roots,
        pagination: {
          cursor: roots.length > 0 ? roots[roots.length - 1].id : null,
          limit: pagination.limit,
          total: pagination.total,
          has_more: pagination.has_more,
        },
      },
      map,
    ];
  }
}
