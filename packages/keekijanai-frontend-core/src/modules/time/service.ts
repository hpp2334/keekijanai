import { container } from "@/core/container";
import { sleep } from "@/utils/common";
import { switchTap } from "@/utils/rxjs-helper";
import { BehaviorSubject, Observable, of, switchMap } from "rxjs";
import { TimeApi } from "./api";

interface LatestGetNow {
  server: number;
  local: {
    beforeReq: number;
    afterReq: number;
  };
}

export class TimeService {
  public now$: BehaviorSubject<number>;
  private latestGetNow: LatestGetNow | null = null;
  private _destroyed = false;

  public constructor(public api: TimeApi) {
    this.now$ = new BehaviorSubject(Date.now());
    this.getNow().subscribe((v) => this.now$.next(v));
    this.maintainSmartNow();
  }

  public getNow(): Observable<number> {
    const localBeforeReq = Date.now();
    return this.api.now().pipe(
      switchMap((res) => of(Number(res.data.time))),
      switchTap((time) => {
        this.latestGetNow = {
          local: {
            beforeReq: localBeforeReq,
            afterReq: Date.now(),
          },
          server: time,
        };
      })
    );
  }

  public destroy() {
    this._destroyed = true;
  }

  private async maintainSmartNow() {
    const handler = () => {
      const now = !this.latestGetNow
        ? this.now$.value
        : Date.now() +
          (this.latestGetNow.server - (this.latestGetNow.local.beforeReq + this.latestGetNow.local.afterReq) / 2);
      this.now$.next(now);
    };
    for (let i = 0; i < 60; i++) {
      if (this._destroyed) {
        return;
      }
      handler();
      await sleep(1000);
    }
    while (!this._destroyed) {
      handler();
      await sleep(20000);
    }
  }
}

container.register({
  class: TimeService,
  constructorArgClasses: [TimeApi],
  mode: "singleton",
});
