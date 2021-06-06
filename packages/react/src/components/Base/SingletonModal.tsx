import React, { useEffect, useReducer, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { Subject, BehaviorSubject } from "rxjs";

let _open$Map: WeakMap<any, Subject<boolean>> | undefined;
let _elementMap: WeakMap<any, HTMLDivElement> | undefined;
const getOpen$ = (id: any) => {
  const open$Map = _open$Map ?? (_open$Map = new Map<string, Subject<boolean>>());
  let cached = open$Map.get(id);
  if (cached === undefined) {
    open$Map.set(id, cached = new Subject());
  }
  return cached;
}
const openHandlerFactory = (id: any) => {
  const open$ = getOpen$(id);
  return {
    open: () => { open$.next(true) },
    close: () => { open$.next(false) },
  }
}


class SingletonModalManager {
  register = (RegisteredComponent: () => JSX.Element) => {
    const id = RegisteredComponent;
    const open$ = getOpen$(id);

    open$.subscribe(open => {
      const elementMap = _elementMap ?? (_elementMap = new Map<string, HTMLDivElement>());
      let _element = elementMap.get(id);
      if (!_element) {
        _element = document.createElement('div');
        elementMap.set(id, _element);

        document.body.append(_element);
        _element.style.display = 'none';
        ReactDOM.render(
          <RegisteredComponent />,
          _element,
        );
      }
      const element = _element;

      if (open) {
        element.style.display = 'block';
      } else {
        element.style.display = 'none';
      }
    });

    return openHandlerFactory(id);
  }
}

export const singletonModalManager = new SingletonModalManager();