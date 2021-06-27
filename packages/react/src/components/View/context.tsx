import { ViewService } from "keekijanai-client-core";
import { createContext, useState } from "react";
import { useKeekijanaiContext } from "../../core/context";
import { useNotNilContextValueFactory } from "../../util";

interface ProviderProps {
  scope: string;
  children?: React.ReactNode;
}

interface ContextValue {
  scope: string;
  viewService: ViewService;
}

const viewContext = createContext<ContextValue | null>(null);
export const useViewContextValue = useNotNilContextValueFactory(viewContext);

export function ViewContext(props: ProviderProps) { 
  const { children, scope } = props;
  const { client } = useKeekijanaiContext();
  const [viewService] = useState(new ViewService(client, scope));

  return (
    <viewContext.Provider value={{ scope, viewService }}>
      {children}
    </viewContext.Provider>
  )
}
