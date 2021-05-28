import React, { useCallback, useMemo, useRef } from 'react';

const DRAGLINE_STYLE = {
  borderBottom: '1px solid red',
  position: 'absolute',
  width: '100%',
  top: 0,
  left: 0,
  display: 'none',
};

export function useDragLine() {
  /** @type {React.MutableRefObject<HTMLDivElement>} */
  const ref = useRef(null);
  const isShownRef = useRef(false);

  const getRefCurrent = useCallback(
    (mustExists = true) => {
      const current = ref.current;
      if (!current && mustExists) throw Error('current is null');
      return current;
    }, []
  );

  const place = useCallback(
    (top, left) => {
      const element = getRefCurrent();
      element.style.top = top + 'px';
      element.style.left = left + 'px';
    }, []
  );

  const show = useCallback(() => {
    const isShown = isShownRef.current;
    if (isShown) return;
    isShownRef.current = true;

    const element = getRefCurrent();
    element.style.borderBottom = '1px solid red';
    element.style.display = 'block';
  }, []);

  const hidden = useCallback(() => {
    const isShown = isShownRef.current;
    if (!isShown) return;
    isShownRef.current = false;

    const element = getRefCurrent();
    element.style.display = 'none';
  }, []);

  const exports = useMemo(() => ({
    show,
    place,
    hidden,
    ref,
  }), [show, place, hidden]);

  return exports;
}

export function DragLine({ dragLineHookObj }) {
  return (
    <div style={DRAGLINE_STYLE} ref={dragLineHookObj.ref}></div>
  );
}
