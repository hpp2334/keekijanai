import { ClassType } from '@/type/util';

export type ProviderConstructor = ClassType<ProviderBase>;

export interface ProviderBase {
  select<T = any>(params: SelectParams): Promise<Response<T>>;
  insert<T = any>(params: InsertParams): Promise<Response<T>>;
  update<T = any>(params: UpdateParams): Promise<Response<T>>;
  delete(params: DeleteParams): Promise<Response>;
}

export interface DecoratedProvider {
  options: {
    transformCamel: boolean;
  }
}

export type WhereOperator = '=';

export type Where = {
  [column: string]: [WhereOperator, any][]
};

export type Order = [string, 'asc' | 'desc'][];

export interface ProviderDecoratorParams {
  key: string;
  transformCamel?: boolean;
}

export interface SelectParams {
  from: string;
  columns?: string[];
  count?: boolean | string;
  order?: Order;
  where?: Where;
  skip?: number;
  take?: number;
  keys: string[];
}

export interface UpdateParams {
  from: string;
  where?: Where;
  payload: any;
  upsert?: boolean;
  keys: string[];
}

export interface InsertParams {
  from: string;
  payload: any;
}

export interface DeleteParams {
  from: string;
  where?: Where;
}

export interface Response<T = any> {
  body: T[] | null;
  count: number | null;
  error: any;
  extra?: any;
}