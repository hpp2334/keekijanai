import { ClassType } from "@/type/util";
import { ContextType } from "../context";
import { MiddlewareType } from "../middleware";

export interface Platform {
  toAPIFactory(handle: (ctx: Pick<ContextType.Context, 'req' | 'res'>) => Promise<void>): (...args: any[]) => any;
  handleResponse: MiddlewareType.Middleware;
}

export type PlatformConstructor = ClassType<Platform>;
