import { CommentCachableService } from "keekijanai-client-core";
import { createContext, useReducer, useState } from "react";
import { useKeekijanaiContext } from "../../core/context";
import { incrReducer, useNotNilContextValueFactory } from "../../util";

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

export function CommentContext(props: ProviderProps) {
  const { children, scope } = props;
  const { client } = useKeekijanaiContext();
  const [mutationCounts, updateMutationCounts] = useReducer(incrReducer, 0);
  const [commentCachableService] = useState(new CommentCachableService(client, scope));

  return (
    <commentContext.Provider value={{ mutationCounts, updateMutationCounts, scope, commentCachableService }}>
      {children}
    </commentContext.Provider>
  )
}

