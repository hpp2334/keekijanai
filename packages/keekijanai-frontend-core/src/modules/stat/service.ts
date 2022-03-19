import { switchTap } from "@/utils/rxjs-helper";
import { Service, ServiceFactory } from "@/core/service";
import { BehaviorSubject, catchError, Observable, of, switchMapTo } from "rxjs";
import { injectable, postConstruct } from "inversify";
import { StatApi } from "./api";
import * as Data from "./data";
import { AuthService } from "../auth";

export class StatService implements Service {
  public destroy = undefined;

  public visit$ = new BehaviorSubject<Data.Visit | null>(null);

  public constructor(private api: StatApi, public belong: string) {}

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

  @postConstruct()
  private postConstruct() {
    this.updateVisit().subscribe();
  }
}

export class StatServiceFactory implements ServiceFactory<[string], StatService> {
  public constructor(private api: StatApi) {}

  public factory(belong: string): StatService {
    return new StatService(this.api, belong);
  }
}
