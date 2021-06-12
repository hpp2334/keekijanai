import joi from 'joi';
import { ClassType } from '@/type/util';
import { ContextType } from '../context';

class ControllerBase {
  ctx!: ContextType.Context;
}

export type {
  ControllerBase
}

export interface DecoratedController {
  $$type: string;
  $$prefix: string;
  $$injectServices?: [string, string][];
  $$routes: Route[];
}

export type RouteHandler = (ctx: ContextType.Context) => Promise<void>;
export interface Route {
  path: string;
  method: string;
  route: RouteHandler;
}

export interface Validation {
  query?: joi.ObjectSchema;
  body?: joi.ObjectSchema;
}

export type ControllerConstructor = ClassType<ControllerBase>;