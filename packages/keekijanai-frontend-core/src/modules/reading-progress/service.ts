import { switchMap } from "rxjs/operators";
import { Observable, of } from "rxjs";
import { GlobalService } from "../global/service";
import { injectable } from "inversify";
import { container } from "@/core/container";
import { isNil } from "@/utils/common";

@injectable()
export class ReadingProgressService {
  public progress$: Observable<number>;

  public constructor(private globalService: GlobalService) {
    this.progress$ = this.globalService.throttleScroll$.pipe(
      switchMap(() => {
        const target = this.globalService.getContainerEl();
        if (isNil(target)) {
          return of(0);
        }

        const current = target.scrollTop;
        const total = target.offsetHeight - target.clientHeight;
        const progress = current / (total + 1e-6);
        return of(progress);
      })
    );
  }
}

container.bind(ReadingProgressService).toSelf();
