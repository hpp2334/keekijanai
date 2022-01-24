import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { Observable, Subject } from "rxjs";
import { keekijanaiConfig } from "../config";

export const axiosInstance = axios.create({
  baseURL: "/api/keekijanai",
});

export const ajax = <T, C>(config: AxiosRequestConfig<C>): Observable<AxiosResponse<T, C>> => {
  const subject = new Subject<AxiosResponse<T, C>>();

  if (keekijanaiConfig.queryRoute) {
    const params = (config.params ??= {});
    params.query_route = config.url;
    config.url = "";
  }

  axiosInstance(config)
    .then((resp) => {
      subject.next(resp);
      subject.complete();
    })
    .catch((err) => {
      subject.error(err);
      subject.complete();
    });

  return subject.asObservable();
};
