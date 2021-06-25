import { i18n } from './i18n';

export { TranslationContext } from './translation-context';

export function addResources(ns: string, map: Record<string, any>) {
  for (const lng in map) {
    i18n.addResources(lng, ns, map[lng]);
  }
}
