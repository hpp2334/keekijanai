import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { Observable, Subject } from "rxjs";

export const axiosInstance = axios.create();

export const ajax = <T, C>(config: AxiosRequestConfig<C>): Observable<AxiosResponse<T, C>> => {
  const subject = new Subject<AxiosResponse<T, C>>();
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
