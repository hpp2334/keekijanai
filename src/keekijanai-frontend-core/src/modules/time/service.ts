import { BehaviorSubject, Observable, of, switchMap } from "rxjs";
import { container, singleton } from "tsyringe";
import { TimeApi } from "./api";

@singleton()
export class TimeService {
  public now$: BehaviorSubject<number>;
  public constructor(public api: TimeApi) {
    this.now$ = new BehaviorSubject(Date.now());
    this.getNow().subscribe((v) => this.now$.next(v));
  }

  public getNow(): Observable<number> {
    return this.api.now().pipe(
      switchMap((res) => {
        return of(Number(res.data.time));
      })
    );
  }
}
