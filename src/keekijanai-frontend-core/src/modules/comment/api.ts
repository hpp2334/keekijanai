import { singleton } from "tsyringe";
import type * as Data from "./data";
import { ajax } from "@/core/request";
import { Observable, of, switchMap } from "rxjs";
import { AxiosResponse } from "axios";
import { keyBy, omit } from "lodash-es";
import { UserVO, CommentVO } from "@/generated/keekijanai-api";
import { StyledCommentVO } from "./data";

@singleton()
export class CommentApi {
  public list(query?: Data.ListCommentQuery) {
    return ajax<Data.ListCommentRespPayload, unknown>({
      url: "/keekijanai/comment",
      params: query,
    }).pipe(
      switchMap((resp) => {
        return of({
          ...resp,
          data: {
            ...omit(resp.data, ["users", "comments"]),
            comments: this.batchToStyledCommentVO(resp.data.comments, resp.data.users),
          },
        });
      })
    );
  }

  public getTree(query: Data.GetTreeCommentQuery) {
    return ajax<Data.GetCommentTreeRespPayload, unknown>({
      url: "/keekijanai/comment/tree",
      params: query,
    }).pipe(
      switchMap((resp) => {
        return of({
          ...resp,
          data: {
            ...omit(resp.data, ["users", "comments"]),
            comments: this.batchToStyledCommentVO(resp.data.comments, resp.data.users),
          },
        });
      })
    );
  }

  public create(params: Data.CreateCommentParams) {
    return ajax<Data.CreateCommentRespPayload, unknown>({
      method: "POST",
      url: "/keekijanai/comment",
      data: params,
    }).pipe(
      switchMap((resp) => {
        const data = resp.data;
        const comment: Data.StyledCommentVO = {
          ...data.payload,
          user: data.user,
        };

        return of({
          ...resp,
          data: {
            payload: comment,
          },
        });
      })
    );
  }

  public remove(id: number): Observable<AxiosResponse<void>> {
    return ajax({
      method: "DELETE",
      url: `/keekijanai/comment/${id}`,
    });
  }

  private batchToStyledCommentVO(comments: CommentVO[], users: UserVO[]): StyledCommentVO[] {
    const userMap = keyBy(users, "id");
    const styledComments = comments.map<Data.StyledCommentVO>((comment) => ({
      ...comment,
      user: userMap[comment.user_id] ?? null,
    }));
    return styledComments;
  }
}
