import { createServiceHook } from "@/common/service";
import { createService, StatServiceFactory } from "@keekijanai/frontend-core";

export const useStatService = createServiceHook(StatServiceFactory);
