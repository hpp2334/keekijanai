import { createService, GlobalService } from "@keekijanai/frontend-core";
import { useMemo } from "react";

export const useGlobalService = () => {
  const globalService = useMemo(() => createService(GlobalService), []);

  return globalService;
};
