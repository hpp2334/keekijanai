import { CommentCachableService } from "keekijanai-client-core";
import { createContext, useReducer, useState } from "react";
import { createNotNilContextState, incrReducer, useMemoExports, useNotNilContextValueFactory } from "../../util";

interface ProviderProps {
  scope: string;
  children?: React.ReactNode;
}

interface ContextValue {
  mutationCounts: number;
  updateMutationCounts: () => void;
  commentCachableService: CommentCachableService;
  scope: string;
}

const commentContext = createContext<ContextValue | null>(null);
export const useCommentContextValue = useNotNilContextValueFactory(commentContext);

export function CommentProvider(props: ProviderProps) {
  const { children, scope } = props;
  const [mutationCounts, updateMutationCounts] = useReducer(incrReducer, 0);
  const [commentCachableService] = useState(new CommentCachableService(scope));

  return (
    <commentContext.Provider value={{ mutationCounts, updateMutationCounts, scope, commentCachableService }}>
      {children}
    </commentContext.Provider>
  )
}

