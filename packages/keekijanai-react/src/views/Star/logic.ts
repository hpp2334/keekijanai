import { createServiceHook } from "@/common/service";
import { createService, StarServiceFactory } from "@keekijanai/frontend-core";

export const useStarService = createServiceHook(StarServiceFactory);
