import { useMemoExports } from "@/util";
import { useCallback, useState } from "react";
import { CodeEffectProps } from "./CodeEffect";
import { CodeSourcesProps } from "./CodeSources";

export function useCodeEffect(props: CodeEffectProps) {
  const { get, type: rawType, entry } = props;

  const [type] = useState(rawType ?? 'react');

  const exports = useMemoExports({
    get,
    type,
    entry,
  });
  return exports;
}

export function useCodeSources(props: CodeSourcesProps) {
  const { get: getRaw, sourceList, nameMap } = props;

  const get = useCallback((key: string) => {
    const raw = getRaw(key);
    return typeof raw === 'object' && raw !== null && 'default' in raw ? raw.default : raw;
  }, []);

  const getName = useCallback((key: string) => {
    return nameMap?.[key] ?? key;
  }, []);

  const [sources] = useState(() => {
    return sourceList.map(src => ({
      key: src,
      name: getName(src),
      source: get(src),
    }));
  });

  const isEmpty = sources.length === 0;

  const exports = useMemoExports({
    get,
    getName,
    sourceList,
    sources,
    isEmpty,
  });
  return exports;
}

export type CodeEffectHookObject = ReturnType<typeof useCodeEffect>;
export type CodeSourcesHookObject = ReturnType<typeof useCodeSources>;
