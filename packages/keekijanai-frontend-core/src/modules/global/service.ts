import { of, fromEvent, interval, debounce, throttle, switchMap } from "rxjs";
import { startWith } from "rxjs/operators";
import { injectable } from "inversify";
import { container } from "@/core/container";

@injectable()
export class GlobalService {
  public get global() {
    if (typeof typeof window === "undefined") {
      throw new Error('global is undefined. "valid" property should be call to check the availabilty of this service.');
    }
    return window;
  }

  public get valid() {
    return typeof this.global !== "undefined";
  }

  private scroll$ = (() => {
    if (typeof this.global === "undefined") {
      return of(null as any as Event);
    }
    return fromEvent(this.global, "scroll");
  })();

  public debouncedScroll$ = this.scroll$.pipe(debounce(() => interval(15)));

  public throttleScroll$ = this.scroll$.pipe(throttle(() => interval(15)));

  public path$ = (() => {
    if (!this.valid) {
      return of(null);
    }
    const getPathname = () => this.global.location.pathname ?? null;
    return fromEvent(this.global, "pushstate").pipe(
      startWith(getPathname()),
      switchMap(() => of(getPathname()))
    );
  })();

  public constructor() {
    this.toTop = this.toTop.bind(this);
  }

  public toTop() {
    this.global?.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  public getContainerEl() {
    if (!this.valid) {
      return null;
    }
    const document = this.global.document;
    return document.documentElement ?? document.body;
  }

  public async copyToClipboard(code: string): Promise<void> {
    return await this.global?.navigator.clipboard.writeText(code);
  }
}

container.bind(GlobalService).toSelf().inSingletonScope();
