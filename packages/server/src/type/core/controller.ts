import { Manager } from "../../core/manager";
import { Context } from "../context";

export interface Controller {
}

export interface ControllerConstructor {
  new (manager: Manager): Controller;
}

export type ControllerHandler = (ctx: Context) => Promise<void>;
