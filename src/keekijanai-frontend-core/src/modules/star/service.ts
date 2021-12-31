import { switchTap } from "@/utils/rxjs-helper";
import { callInit, OnInit } from "@/core/service";
import { BehaviorSubject, catchError, Observable, of, switchMapTo } from "rxjs";
import { singleton } from "tsyringe";
import { StarApi } from "./api";
import { Star, StarType } from "./data";
import { AuthService } from "../auth";

@singleton()
export class StarService implements OnInit<[string]> {
  public belong!: string;
  public current$: BehaviorSubject<Star | null>;

  public constructor(private _authService: AuthService, private api: StarApi) {
    callInit(_authService);

    this.current$ = new BehaviorSubject<Star | null>(null);
  }

  public initialize(belong: string) {
    this.belong = belong;

    this.updateCurrent().subscribe();
  }

  public updateCurrent(): Observable<unknown> {
    return this.api.getCurrent(this.belong).pipe(
      switchTap((resp) => {
        const star: Star = {
          current: resp.data.current ?? undefined,
          total: resp.data.total,
        };
        this.current$.next(star);
        return of(null);
      }),
      switchMapTo(of(null))
    );
  }

  public update(starType: StarType): Observable<unknown> {
    const preValue = this.current$.value;
    const nextValue = starType === preValue?.current ? StarType.UnStar : starType;

    return this.offlineReduceStar(nextValue).pipe(
      switchTap(() => {
        return this.api.update(this.belong, {
          star_type: nextValue,
        });
      }),
      switchMapTo(of(null)),
      catchError((err) => {
        this.current$.next(preValue);

        throw err;
      })
    );
  }

  private offlineReduceStar(nextStarType: StarType): Observable<unknown> {
    if (this.current$ === null) {
      return of(null);
    }
    const current = this.current$.value;
    if (current?.current === undefined) {
      return of(null);
    } else {
      const delta = this.mapStarTypeToValue(nextStarType) - this.mapStarTypeToValue(current.current);
      current.total += delta;
      current.current = nextStarType;
      this.current$.next({ ...current });
      return of(null);
    }
  }

  private mapStarTypeToValue(starType: StarType | undefined | null): number {
    switch (starType) {
      case StarType.UnStar:
        return 0;
      case StarType.Bad:
        return -1;
      case StarType.JustOK:
        return 0;
      case StarType.Good:
        return 1;
      default:
        return 0;
    }
  }
}
