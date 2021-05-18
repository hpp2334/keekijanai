import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { Subject, Subscription } from "rxjs";

const open$Map = new Map<string, Subject<boolean>>();
const getOpen$ = (id: string) => {
  let cached = open$Map.get(id);
  if (cached === undefined) {
    open$Map.set(id, cached = new Subject());
  }
  return cached;
}

class SingletonModalManager {
  list: Array<{ id: string; Component: () => JSX.Element}> = [];
  
  register = (id: string, RegisteredComponent: () => JSX.Element) => {
    const open$ = getOpen$(id);

    function WrapperComponent() {
      const [open, setOpen] = useState(false);
      useEffect(() => {
        const subscription = open$.subscribe(setOpen);

        return () => {
          setOpen(false);
          subscription.unsubscribe();
        }
      }, []);

      return (
        <>
          {open ? <RegisteredComponent /> : null}
        </>
      );
    }
    this.list.push({ id, Component: WrapperComponent })
  }

  Components = () => {
    return (
      <div className="__Keekijanai__global-style">
        {this.list.map(({ id, Component }) => <Component key={id} />)}
      </div>
    )
  }
}

export const singletonModalManager = new SingletonModalManager();
export const openHandlerFactory = (id: string) => {
  const open$ = getOpen$(id);
  return {
    open: () => { open$.next(true) },
    close: () => { open$.next(false) },
  }
}
