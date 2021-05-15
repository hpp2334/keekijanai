import { User } from ".";

export interface Get {
  id: number;
  scope: string;
  content: string;
  plainText: string;
  cTime: number;
  referenceId?: number;
  parentId?: number;
  userId: string;
  childCounts: number;
}

export type Create = Omit<Get, 'id' | 'cTime' | 'userId' | 'childCounts'>;

export type List = {
  total: number;
  comments: Array<Get>
};

export type Delete = {
  id: number;
}