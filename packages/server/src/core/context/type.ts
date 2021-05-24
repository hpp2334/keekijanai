import { ServiceType } from '@/core/service';

export type Context = {
  req: {
    _req: any;
    method: string;
    headers?: Record<string, any>;
    query?: Record<string, any>;
    cookies?: Record<string, any>;
    body: any;
  };
  res: {
    _res: any;
    body: any;
    status?: number;
    setHeader: (header: string, value: string) => void;
    redirect: (url: string) => void;
  };
  state: any;
  getService: (key: string) => ServiceType.ServiceBase;
};
