import { createService, StatServiceFactory } from "@keekijanai/frontend-core";

export const useStatService = (belong: string) => {
  const service = createService(StatServiceFactory, belong);

  return service;
};
