import { ClassType } from '@/type/util';
import type { ProviderBase } from './base';

export type ProviderConstructor = ClassType<ProviderBase>;

export type WhereOperator = '=';

export type Where = {
  [column: string]: [WhereOperator, any][]
};

export interface ProviderDecoratorParams {
  key: string;
  transformCamel?: boolean;
}

export interface SelectParams {
  from: string;
  columns?: string[];
  count?: boolean | string;
  order?: [string, 'asc' | 'desc'][];
  where?: Where;
  skip?: number;
  take?: number;
}

export interface UpdateParams {
  from: string;
  where?: Where;
  payload: any;
  upsert?: boolean;
}

export interface DeleteParams {
  from: string;
  where?: Where;
}

export interface Response<T = any> {
  body: T[] | null;
  count: number | null;
  error: any;
}