import { isPromise } from "./util/common";
import { EventHookManager } from "./util/hook";

export interface ResourceUpdatedEventPayload {
  namespace: string;
  resource: any;
}

type ResourceFetchHandler<T> = (lang: string) => Promise<T> | T;

export function detectBrowserLanguage() {
  if (typeof navigator !== "undefined" && "language" in navigator) {
    return navigator.language;
  }
}

class I18nBuilder {
  private _defaultLanguage: string | undefined;
  private _defaultContent: string | undefined;
  private _language: string | undefined;

  public language(lang: string | (() => string)) {
    this._language = typeof lang === "string" ? lang : lang();
    return this;
  }

  public defaultLanguage(lang: string) {
    this._defaultLanguage = lang;
    return this;
  }

  public defaultContent(content: string) {
    this._defaultContent = content;
  }

  public build(): I18n {
    const defaultLanguage = this._defaultLanguage ?? "en";
    const language = this._language ?? defaultLanguage;

    const instance = new I18n();
    instance._defaultContent = this._defaultContent ?? "";
    instance._defaultLanguage = defaultLanguage;
    instance._language = language;
    return instance;
  }
}

export class I18n {
  public _defaultLanguage!: string;
  public _defaultContent!: string;
  public _language!: string;

  private isDestroyed = false;
  private resolvedResources = new Map<string, Record<string, any>>();
  private resourceHandlerMap = new Map<string, ResourceFetchHandler<any>>();
  private eventHookManagers = {
    resourceUpdated: new EventHookManager<ResourceUpdatedEventPayload>(),
    resourceNeedUpdate: new EventHookManager<null>(),
    languageChanged: new EventHookManager<string>(),
  };

  public get language() {
    return this._language ?? this._defaultLanguage;
  }

  public constructor() {
    const resourceNeedUpdateEvt = {
      name: null,
      payload: null,
    };
    this.addLanguageChangedListener(() => {
      this.eventHookManagers.resourceNeedUpdate.notify(resourceNeedUpdateEvt);
    });
    this.addResourceNeedUpdateListener(() => {
      for (const [namespace, handler] of this.resourceHandlerMap) {
        this.callResourceFetchHandler(namespace, handler);
      }
    });
  }

  public getContent(namespace: string, key: string, fallbackContent?: string): string {
    const resource = this.resolvedResources.get(namespace);
    return resource?.[key] ?? fallbackContent ?? this._defaultContent;
  }

  /** would call handler immediately */
  public setResourceFetchHandler<T>(namespace: string, handler: ResourceFetchHandler<T>) {
    this.resourceHandlerMap.set(namespace, handler);
    this.callResourceFetchHandler(namespace, handler);

    return () => {
      this.resourceHandlerMap.delete(namespace);
    };
  }

  public changeLanguage(language: string) {
    this.throwExceptionIfDestroyed();
    this._language = language;
    this.eventHookManagers.languageChanged.notify({
      name: null,
      payload: language,
    });
  }

  public addResourceNeedUpdateListener(handler: () => void) {
    this.throwExceptionIfDestroyed();
    return this.eventHookManagers.resourceNeedUpdate.add(handler);
  }

  public addResourceUpdatedListener(handler: (payload: ResourceUpdatedEventPayload) => void) {
    this.throwExceptionIfDestroyed();
    return this.eventHookManagers.resourceUpdated.add((ev) => handler(ev.payload));
  }

  public addLanguageChangedListener(handler: (language: string) => void) {
    this.throwExceptionIfDestroyed();
    return this.eventHookManagers.languageChanged.add(() => handler(this.language));
  }

  public destroy() {
    this.isDestroyed = true;
    Object.values(this.eventHookManagers).forEach((map) => map.clear());
    this.resourceHandlerMap.clear();
    this.resolvedResources.clear();
  }

  private callResourceFetchHandler<T>(namespace: string, handler: ResourceFetchHandler<T>) {
    const defaultLang = this._defaultLanguage;
    const currentLang = this.language;

    console.debug("[I18n][callResourceFetchHandler]", { defaultLang, currentLang });

    this.updateResource(namespace, handler(currentLang))
      .catch((err) => {
        if (currentLang === defaultLang) {
          throw err;
        }
        console.warn(
          `[keekijanai-i18n] for namespace ${namespace} load locales ${currentLang} fail, fallback to load locales ${defaultLang}`
        );
        return this.updateResource(namespace, handler(defaultLang));
      })
      .catch((err) => {
        console.error(`[keekijanai-i18n] for namespace ${namespace}, load lacales ${defaultLang} fail.`);
        throw err;
      });
  }

  private updateResource<T = unknown>(namespace: string, resource: Promise<T> | T) {
    this.throwExceptionIfDestroyed();

    if (isPromise(resource)) {
      return resource.then((resource) => {
        if (this.isDestroyed) {
          return;
        }
        this.resolvedResources.set(namespace, resource);
        this.notifyResourceUpdated(namespace, resource);
      });
    } else {
      this.resolvedResources.set(namespace, resource);
      this.notifyResourceUpdated(namespace, resource);
      return Promise.resolve(undefined);
    }
  }

  private notifyResourceUpdated(namespace: any, resource: any) {
    this.throwExceptionIfDestroyed();
    this.eventHookManagers.resourceUpdated.notify({
      name: null,
      payload: {
        namespace,
        resource,
      },
    });
  }

  private throwExceptionIfDestroyed() {
    if (this.isDestroyed) {
      throw new Error("i18n instance is destroyed. Cannot execute this operation.");
    }
  }

  public static builder() {
    return new I18nBuilder();
  }
}
