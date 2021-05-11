import { Star, Comment, Grouping, Auth, StarService, AuthService, CommentService, ViewService } from "..";
import { ConfigReader } from "../../config";
import type { Manager } from "../../core/manager";
import { ServerlessContext } from "../../_framework";
import { Context } from "../context";
import { TimeService, UserService } from "../services";
import { ServiceConstructor } from "./service";



export interface ProviderFactory {
  factory(ctx: Context, config?: any): Promise<Provider>;
}

export interface Provider {
  manager: Manager;
  context: Context;
  config?: any;

  getServiceConstructor(name: string): ServiceConstructor;
}
