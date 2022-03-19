import { createServiceHook } from "@/common/service";
import { AuthService, createService } from "@keekijanai/frontend-core";

export const useAuthService = createServiceHook(AuthService);
