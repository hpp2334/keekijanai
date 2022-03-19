import { createService, StarServiceFactory } from "@keekijanai/frontend-core";

export const useStarService = (belong: string) => {
  const service = createService(StarServiceFactory, belong);

  return service;
};
