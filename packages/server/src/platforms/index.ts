import { PlatformConstructor } from "../type/serveless-platform";
import { createClassFactory } from "../utils/fns";

export const platformFactory = createClassFactory<PlatformConstructor>();
