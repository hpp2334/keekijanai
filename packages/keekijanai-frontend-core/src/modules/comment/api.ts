import type * as Data from "./data";
import { ajax } from "@/core/request";
import { container } from "@/core/container";

export class CommentApi {
  public list(query?: Data.ListCommentQuery) {
    return ajax<Data.ListCommentRespPayload>({
      url: "/comment",
      params: query,
    });
  }

  public getTree(query: Data.GetCommentTreeQuery) {
    return ajax<Data.GetCommentTreeRespPayload>({
      url: "/comment/tree",
      params: query,
    });
  }

  public create(params: Data.CreateCommentParams) {
    return ajax<Data.CreateCommentRespPayload>({
      method: "POST",
      url: "/comment",
      data: params,
    });
  }

  public remove(id: number) {
    return ajax({
      method: "DELETE",
      url: `/comment/${id}`,
    });
  }
}

container.register({
  class: CommentApi,
  constructorArgClasses: [],
});
