import { of, Observable, Subject, BehaviorSubject, combineLatest, Subscription } from "rxjs";
import { startWith, switchMap, switchMapTo, tap } from "rxjs/operators";
import { GlobalService } from "../global/service";
import { injectable, inject } from "inversify";
import { isNil, keyBy } from "@/utils/common";
import { Service } from "@/core/service";

export type TOCLevel = 1 | 2 | 3 | 4;

export type TOCHeading = {
  id: string;
  level: TOCLevel;
  title: any;
  ref: {
    current: HTMLHeadingElement | null;
  };
};

@injectable()
export class TOCService implements Service {
  private allocHeadingId = 1;
  private shouldScrollToMatchedHeading$ = new Subject<boolean>();
  private subscriptions: Subscription[] = [];

  public readonly offsetY$ = new BehaviorSubject(0);

  public readonly headings$ = new BehaviorSubject([] as TOCHeading[]);

  private headingMap$ = this.headings$.pipe(
    switchMap((headings) => {
      const headingEntries: [string, TOCHeading][] = Object.entries(keyBy(headings, "id"));
      const headingMap = new Map(headingEntries);

      console.debug("[toc.service] pipe heading$ to headingMap$", { headings, headingEntries, headingMap });
      return of(headingMap);
    })
  );

  public readonly activeHeading$: Observable<TOCHeading | null>;

  public constructor(private globalService: GlobalService) {
    const scrollToMatchedHeadingSubscription = combineLatest([
      this.headingMap$,
      this.offsetY$,
      this.shouldScrollToMatchedHeading$,
    ]).subscribe(([headingMap, offsetY]) => {
      if (isNil(this.globalService.global)) {
        return;
      }
      const hash = this.globalService.global.location.hash;
      const id = hash.match(/^#toc-(.+)$/)?.[1];

      console.debug("[toc.service] scroll to matched heading", { id, hash });

      if (!isNil(id)) {
        const heading = headingMap.get(id);
        const headingEl = heading?.ref.current;
        const rect = headingEl?.getBoundingClientRect();
        const container = this.globalService.getContainerEl()!;

        console.debug("[toc.service] scroll to matched heading", { heading, headingEl, rect });

        if (!isNil(rect)) {
          const Epsilon = 5;
          const top = rect.top + container.scrollTop - offsetY + Epsilon;
          console.debug("[toc.service]", { top });

          this.globalService.global.scrollTo({
            top: Math.max(top, 0),
          });
        }
      }
    });

    this.subscriptions.push(scrollToMatchedHeadingSubscription);

    this.activeHeading$ = combineLatest([
      this.headings$,
      this.offsetY$,
      this.globalService.debouncedScroll$.pipe(switchMapTo(of(null)), startWith(null)),
    ]).pipe(
      switchMap(([headings, offsetY]) => {
        if (headings.length === 0) {
          return of(null);
        }

        const index = headings.findIndex((heading) => {
          const current = heading.ref.current;
          if (isNil(current)) {
            return false;
          }
          const rect = current.getBoundingClientRect();

          return rect.top > offsetY;
        });

        if (index === -1) {
          return of(headings[headings.length - 1]);
        }
        if (index === 0) {
          return of(headings[0]);
        }
        return of(headings[index - 1]);
      })
    );
  }

  public activateHeading(heading: TOCHeading) {
    if (!this.globalService.valid) {
      return;
    }
    const global = this.globalService.global;
    console.debug("[toc.service]", "activeHeading", { heading });
    global.location.hash = `toc-${heading.id}`;
    this.shouldScrollToMatchedHeading$.next(true);
  }

  public clearHeadings() {
    this.headings$.next([]);
    this.allocHeadingId = 1;
  }

  public collectHeading(heading: Omit<TOCHeading, "id">) {
    const collectedHeading = { ...heading, id: String(this.allocHeadingId) };

    console.debug("[toc.service] collectHeading", { collectedHeading });
    this.headings$.next([...this.headings$.value, collectedHeading]);
    this.allocHeadingId += 1;
  }

  public destroy() {
    this.headings$.next([]);

    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    this.subscriptions = [];
  }
}
