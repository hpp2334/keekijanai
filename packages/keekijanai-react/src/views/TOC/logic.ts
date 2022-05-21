import { createService, TOCService } from "@keekijanai/frontend-core";
import { useLayoutEffect } from "react";

export const useTOCService = () => {
  const service = createService(TOCService);

  useLayoutEffect(() => {
    return () => {
      service.destroy();
    };
  }, [service]);

  return service;
};
