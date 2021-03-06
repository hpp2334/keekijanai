import { BehaviorSubject, combineLatest, Observable, of, Subscription } from "rxjs";
import { distinctUntilChanged, filter, switchMap } from "rxjs/operators";
import { Service } from "@/core/service";
import { isNil } from "@/utils/common";
import { container } from "@/core/container";

export interface SeriesItem {
  title?: string;
  path?: string;
  children?: Array<SeriesItem>;
  disable?: boolean;
}

export interface Series {
  name: string;
  prefix?: string;
  data: Array<SeriesItem>;
}

export interface NormalizedSeriesItem {
  title?: string;
  path?: string;
  level: number;
  match: boolean;
  disable: boolean;
}

export interface NormalizedSeries {
  name: string;
  prefix?: string;
  data: Array<NormalizedSeriesItem>;
}

export class SeriesService implements Service {
  public currentPath$ = new BehaviorSubject<string | null>(null);
  public series$ = new BehaviorSubject<Series | null>(null);
  public normalizedSeries$ = new BehaviorSubject<NormalizedSeries | null>(null);

  public currentSeries$ = combineLatest([this.currentPath$, this.normalizedSeries$]).pipe(
    switchMap(([currentPath, normalizedSeries]) => {
      if (isNil(currentPath)) {
        return of(null);
      }
      const series = normalizedSeries?.data.find(
        (series) => !isNil(series.path) && this.isSlugEqual(series.path, currentPath)
      );
      return of(series ?? null);
    })
  );

  private subscriptions: Array<Subscription> = [];

  public constructor() {
    this.subscriptions.push(
      this.series$
        .pipe(
          filter((series) => !isNil(series)),
          distinctUntilChanged()
        )
        .subscribe((series) => {
          const normalized = this.normalizeSeries(series!);
          this.normalizedSeries$.next(normalized);
        })
    );
    this.subscriptions.push(
      this.currentPath$.subscribe((currentPath) => {
        const normalized = this.normalizedSeries$.value;
        console.debug("[series.service]", "[subscription currentPath$]", {
          currentPath,
          normalizedCurrentPath: currentPath && this.normalizeSlug(currentPath),
        });

        if (!isNil(normalized)) {
          normalized.data.forEach((item) => {
            item.match = this.isSlugEqual(currentPath, item.path);
          });
          this.normalizedSeries$.next({
            ...normalized,
          });
        }
      })
    );
  }

  public destroy() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  private normalizeSeries(series: Series): NormalizedSeries {
    const normalizedItems: Array<NormalizedSeriesItem> = [];
    const currentPath = this.currentPath$.value;
    const handleSeriesItems = (items: SeriesItem[], level = 1) => {
      for (const item of items) {
        const normalizedItemPath = !isNil(item.path) ? this.normalizeSlug(series.prefix ?? "", item.path) : undefined;
        normalizedItems.push({
          title: item.title,
          path: normalizedItemPath,
          level,
          match: this.isSlugEqual(currentPath, normalizedItemPath),
          disable: Boolean(item.disable),
        });
        if (item.children && item.children.length > 0) {
          handleSeriesItems(item.children, level + 1);
        }
      }
    };
    handleSeriesItems(series.data);

    return {
      name: series.name,
      prefix: series.prefix,
      data: normalizedItems,
    };
  }

  private normalizeSlug(...paths: string[]) {
    return paths.join("/").split("/").filter(Boolean).join("/") + "/";
  }

  private isSlugEqual(a: string | undefined | null, b: string | undefined | null) {
    if (isNil(a) || isNil(b)) {
      return false;
    }
    return this.normalizeSlug(a) === this.normalizeSlug(b);
  }
}

container.register({
  class: SeriesService,
  constructorArgClasses: [],
});
