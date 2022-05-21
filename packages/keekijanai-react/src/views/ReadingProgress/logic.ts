import { ReadingProgressService, createService } from "@keekijanai/frontend-core";
import { useMemo } from "react";

export const useReadingProgressService = () => {
  const service = useMemo(() => createService(ReadingProgressService), []);

  return service;
};
