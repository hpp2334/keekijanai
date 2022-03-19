import { createServiceHook } from "@/common/service";
import { createService, TimeService } from "@keekijanai/frontend-core";
import { useMemo } from "react";

export const useTimeService = createServiceHook(TimeService);
