import { Core } from "../type";
import { createClassFactory } from "../utils/fns";
import { Manager } from "./manager";

class ControllerBase implements Core.Controller {
  constructor(public manager: Manager) {}
}

const controllerFactory = createClassFactory<Core.ControllerConstructor>();

export {
  ControllerBase as Controller,
  controllerFactory,
}