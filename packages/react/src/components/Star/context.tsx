import { StarService } from "keekijanai-client-core";
import { createContext, useState } from "react";
import { useKeekijanaiContext } from "../../core/context";
import { useNotNilContextValueFactory } from "../../util";

interface ProviderProps {
  scope: string;
  children?: React.ReactNode;
}

interface ContextValue {
  scope: string;
  starService: StarService;
}

const commentContext = createContext<ContextValue | null>(null);
export const useStarContext = useNotNilContextValueFactory(commentContext);

export function StarContext(props: ProviderProps) { 
  const { children, scope } = props;
  const { client } = useKeekijanaiContext();
  const [starService] = useState(new StarService(client, scope));

  return (
    <commentContext.Provider value={{ scope, starService }}>
      {children}
    </commentContext.Provider>
  )
}
