import { User } from "./user";
import { Grouping } from "../util";

interface Core {
  id: number;
  type: number;
  title: string | null;
  abstract: string | null;
  content: string | null;
}

export interface Get {
  id: number;
  scope: string;
  articleId: number;
  creatorId: string;
  lastUpdateUserId: string;
  predecessorId?: number;
  cTime: number;
  mTime: number;

  article: Core;
  creator: User | null;
  lastUpdateUser: User | null;
}

export interface List {
  total: number;
  pagination: Grouping | null;
  data: Get[];
  fields?: Array<string>;
}

export interface CoreGet extends Core {}
export interface CoreCreate extends Omit<Core, "id"> {}
export interface CoreUpdate extends Core {}

export interface Create extends Pick<Get, "scope"> {
  article: CoreCreate;
}

export type UpdateArticleCore = CoreCreate;

