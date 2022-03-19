import { BehaviorSubject, combineLatest, Observable, Subscription } from "rxjs";
import { distinctUntilChanged, filter } from "rxjs/operators";
import { injectable } from "inversify";
import { Service } from "@/core/service";
import { isNil } from "@/utils/common";

export interface SeriesItem {
  title?: string;
  path?: string;
  children?: Array<SeriesItem>;
  wip?: boolean;
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
  wip: boolean;
}

export interface NormalizedSeries {
  name: string;
  prefix?: string;
  data: Array<NormalizedSeriesItem>;
}

@injectable()
export class SeriesService implements Service {
  public currentPath$ = new BehaviorSubject<string | null>(null);
  public series$ = new BehaviorSubject<Series | null>(null);
  public normalizedSeries$ = new BehaviorSubject<NormalizedSeries | null>(null);

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
          wip: Boolean(item.wip),
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
