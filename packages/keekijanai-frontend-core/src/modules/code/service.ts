import { isNil, isObjectLike, shouldOverride } from "@/utils/common";
import { BehaviorSubject, combineLatest, filter, of, Subject, switchMap } from "rxjs";
import { first } from "rxjs/operators";
import { injectable } from "inversify";
import { GlobalService } from "../global/service";
import { container } from "@/core/container";
import { Service } from "@/core/service";

export type GetSourceHandler = (key: string) => string | { default: string };

// native: { html: string, handler: () => void }
// react: { default: React.ComponentType }
export type GetRenderHandler = (key: string) => any;

/** source key -> name */
export type SourceNameMap = Record<string, string | undefined>;

export enum RenderType {
  NotFound,
  Native,
  React,
}

export type GetRenderResult = {
  key: string;
} & (
  | {
      type: RenderType.NotFound;
    }
  | {
      type: RenderType.Native;
      html: string;
      handler: () => void;
    }
  | {
      type: RenderType.React;
      // TODO react type
      Component: any;
    }
);

// TODO use a libarary or add more mannually
const KEY2LANG = [
  [/\.jsx?$/, "javascript"],
  [/\.mjs$/, "javascript"],
  [/\.tsx?$/, "typescript"],
  [/\.css$/, "css"],
  [/\.html$/, "html"],
  [/\.rs$/, "rust"],
  [/\.json$/, "json"],
  [/\.ya?ml$/, "yaml"],
] as const;

@injectable()
export class CodeService implements Service {
  /** get source code (In webpack, require.context API and raw-loader can be used to obtain it) */
  private _getSource: GetSourceHandler = shouldOverride("getSource");

  /** get exported content (In webpack, require.context API can be used to obtain it)) */
  private _getRender: GetRenderHandler = shouldOverride("getRender");

  public sourceKeys$ = new Subject<string[]>();

  public sourceKeyMap$ = new BehaviorSubject<SourceNameMap>({});

  public currentSourceKey$ = new BehaviorSubject<string | null>(null);

  public currentSourceCode$ = new BehaviorSubject<string | null>(null);

  public currentSourceCodeLanguage$ = this.currentSourceKey$.pipe(
    switchMap((key) => {
      if (isNil(key)) {
        return of(null);
      }
      const lang = KEY2LANG.find(([re]) => re.test(key))?.[1] ?? null;
      return of(lang);
    })
  );

  public sourceEntries$ = combineLatest([this.sourceKeys$, this.sourceKeyMap$]).pipe(
    switchMap(([sourceKeys, sourceKeyMap]) => {
      return of(sourceKeys.map((key) => ({ key, name: sourceKeyMap[key] ?? key })));
    })
  );

  public constructor(private globalService: GlobalService) {
    this.sourceKeys$.pipe(first()).subscribe((sourceKeys) => {
      if (sourceKeys.length > 0) {
        const [sourceKey] = sourceKeys;
        this.currentSourceKey$.next(sourceKey);
      }
    });

    this.currentSourceKey$
      .pipe(
        switchMap((key) => {
          if (isNil(key)) {
            return of(null);
          }
          const _code = this._getSource(key);
          const code = typeof _code === "object" ? _code.default : _code;
          return of(code);
        })
      )
      .subscribe((code) => {
        this.currentSourceCode$.next(code);
      });

    this.copyCode = this.copyCode.bind(this);
  }

  public destroy: (() => void) | undefined = undefined;

  public async copyCode(): Promise<boolean> {
    const code = this.currentSourceCode$.value;
    if (isNil(code)) {
      return false;
    }
    await this.globalService.copyToClipboard(code);
    return true;
  }

  public getRenderedElement(key: string): GetRenderResult {
    console.debug("[code.service]", "[getRenderedElement]", { key });
    const exported = this._getRender(key);

    console.debug("[code.service]", "[getRenderedElement]", { exported });

    if (isObjectLike(exported) && "default" in exported && typeof exported.default === "function") {
      const Component = exported.default;
      return {
        type: RenderType.React,
        key,
        Component,
      };
    }
    if (isObjectLike(exported) && "html" in exported) {
      const { html, handler } = exported as { html: string; handler: () => void };

      return {
        type: RenderType.Native,
        key,
        html,
        handler,
      };
    }
    return {
      type: RenderType.NotFound,
      key,
    };
  }

  public setGetSource(handler: GetSourceHandler) {
    this._getSource = handler;
    return this;
  }
  public setGetRender(handler: GetRenderHandler) {
    this._getRender = handler;
    return this;
  }
}

container.bind(CodeService).toSelf();
