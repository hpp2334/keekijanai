import { switchTap } from "@/utils/rxjs-helper";
import { callInit, OnInit } from "@/core/service";
import { BehaviorSubject, catchError, Observable, of, switchMapTo } from "rxjs";
import { singleton } from "tsyringe";
import { StatApi } from "./api";
import * as Data from "./data";
import { AuthService } from "../auth";

@singleton()
export class StatService implements OnInit<[string]> {
  public belong!: string;
  public visit$: BehaviorSubject<Data.Visit | null>;

  public constructor(private api: StatApi) {
    this.visit$ = new BehaviorSubject<Data.Visit | null>(null);
  }

  public initialize(belong: string) {
    this.belong = belong;

    this.updateVisit().subscribe();
  }

  public updateVisit(): Observable<unknown> {
    return this.api.update(this.belong).pipe(
      switchTap((resp) => {
        const visit = resp.data;
        this.visit$.next(visit);
        return of(null);
      }),
      switchMapTo(of(null))
    );
  }
}
