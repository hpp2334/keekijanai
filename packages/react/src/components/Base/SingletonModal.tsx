import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { Subject } from "rxjs";

interface ModalProps {
  children: React.ReactNode;
  id: string;
  target?: Element;
}

const refCountMap = new Map<string, number>();
function counterFactory(id: string) {
  return {
    update(delta: number) {
      const to = (refCountMap.get(id) ?? 0) + delta;
      refCountMap.set(id, to);
      return to;
    },
    get() {
      return refCountMap.get(id) ?? 0;
    }
  }
}

const open$Map = new Map<string, Subject<boolean>>();

function SingletonModal(props: ModalProps) {
  const { children, id, target = document.body } = props;
  const [counter] = useState(counterFactory(id));
  const cnt = counter.update(1);
  const [container] = useState(() => {
    let container = document.getElementById(id);
    if (!container || cnt === 1) {
      container = document.createElement('div')
      container.id = id;
      target.appendChild(container);
    }
    return container;
  });

  useEffect(() => {
    return () => {
      const v = counter.update(-1);
      if (v === 0) {
        target.removeChild(container);
      }
    }
  }, []);

  if (cnt > 1) {
    return null;
  }

  return ReactDOM.createPortal(
    children,
    container,
  );
}

export function withSingletonModal(id: string, children: React.ReactNode, useOpenHandler = false) {
  if (!useOpenHandler) {
    return function WrappedSingletonModal() {
      return (
        <SingletonModal id={id}>
          {children}  
        </SingletonModal>
      )
    }
  } else {
    let cached = open$Map.get(id);
    if (cached === undefined) {
      open$Map.set(id, cached = new Subject());
    }
    const open$ = cached;

    return function WrappedSingletonModalWithOpenHandler() {
      const [open, setOpen] = useState(false);
      useEffect(() => {
        open$.subscribe(setOpen);
      }, []);

      return !open ? null : (
        <SingletonModal id={id}>
          {children}  
        </SingletonModal>
      )
    }
  }
}

export const openHandlerFactory = (id: string) => {
  let cached = open$Map.get(id);
  if (cached === undefined) {
    open$Map.set(id, cached = new Subject());
  }
  const open$ = cached;

  return {
    open: () => { open$.next(true) },
    close: () => { open$.next(false) },
  }
}
