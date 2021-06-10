import { StarService } from "keekijanai-client-core";
import { createContext, useState } from "react";
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
export const useStarContextValue = useNotNilContextValueFactory(commentContext);

export function StarProvider(props: ProviderProps) { 
  const { children, scope } = props;
  const [starService] = useState(new StarService(scope));

  return (
    <commentContext.Provider value={{ scope, starService }}>
      {children}
    </commentContext.Provider>
  )
}
