import { ContextStore, useContextStore } from "../../../util/hooks/useContextStore";
import { CommentService, CommentSmartService } from "keekijanai-client-core";
import { createContext, useCallback, useReducer, useState } from "react";
import { TFunction, useTranslation } from "react-i18next";
import { useKeekijanaiContext } from "../../../core/context";
import { incrReducer, useNotNilContextValueFactory } from "../../../util";
import resourcesMap from '../translations';
import { addResources } from '../../../core/translation';

import {
  commentPostStore
} from './stores';
import { useMount } from "react-use";
import { RefreshHook, useRefresh } from "../../../util/hooks/useFresh";

interface ProviderProps {
  scope: string;
  children?: React.ReactNode;
  mainPageSize?: number;
  subPageSize?: number;
  listMaxHeight: {
    main: number;
    sub?: number;
  }
}

interface ContextValue {
  refresh: RefreshHook;
  commentService: CommentSmartService;
  scope: string;
  mainPageSize: number;
  subPageSize: number;
  t: TFunction<["comment", "translation"]>;
  stores: {
    post: ContextStore<commentPostStore.State, commentPostStore.Action>
  }
  listMaxHeight: {
    main: number;
    sub: number;
  }
}


const commentContext = createContext<ContextValue | null>(null);
export const useCommentContext = useNotNilContextValueFactory(commentContext);

// i18n
addResources('comment', resourcesMap);

export function CommentContext(props: ProviderProps) {
  const { children, scope, mainPageSize = 10, subPageSize = 10 } = props;
  const { client } = useKeekijanaiContext();
  // const [mutationCounts, updateMutationCounts] = useReducer(incrReducer, 0);
  const [commentService] = useState(
    new CommentSmartService(client, scope)
  );
  const refresh = useRefresh();
  const { t } = useTranslation(["comment", "translation"]);

  const stores = {
    post: useContextStore(commentPostStore),
  };
  const listMaxHeight = {
    main: props.listMaxHeight.main,
    sub: props.listMaxHeight.sub ?? props.listMaxHeight.main,
  };

  return (
    <commentContext.Provider
      value={{
        refresh,
        scope,
        commentService,
        t,
        mainPageSize,
        subPageSize,
        stores,
        listMaxHeight,
      }}
    >
      {children}
    </commentContext.Provider>
  );
}
