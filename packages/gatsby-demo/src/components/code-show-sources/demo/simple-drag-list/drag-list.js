import React, { useCallback, useMemo, useRef } from 'react'
import { DragLine, useDragLine } from './drag-line';

const DRAG_LIST_STYLE = {
  position: 'relative',
  maxHeight: '200px',
  overflowY: 'auto',
};

function noop() {}
function handlePreventDefault(ev) {
  ev.preventDefault();
}

export function DragList({ list, ItemContainer, onDrop: emitDrop }) {
  const containerRef = useRef(null);
  const positionRef = useRef({
    fromIndex: -1,
    toIndex: -1,
  });
  const dragLineHookObj = useDragLine();

  const setDragable = useCallback((ev) => { ev.target && (ev.target.draggable = true); });
  const setNotDragable = useCallback((ev) => { ev.target && (ev.target.draggable = false); });

  const getPlacePosition = useCallback(
    (element, fromIndex, toIndex) => {
      const container = containerRef.current;
      const rectChild = element.getBoundingClientRect();
      const rectParent = container.getBoundingClientRect();
      const verticalPosRelViewport = fromIndex < toIndex
        ? rectChild.bottom
        : rectChild.top;
      return [verticalPosRelViewport - rectParent.top + container.scrollTop, 0];
    },
    []
  );

  const onMouseDown = setDragable;
  const onDragStart = useCallback((ev) => {
    const index = ev.target.dataset.draglistindex;
    positionRef.current.fromIndex = index;
    ev.dataTransfer.dropEffect = 'copy';
    ev.dataTransfer.setData('text/plain', '');
  }, []);
  const onDrag = noop;
  const onDragEnd = setNotDragable;

  const onDragEnter = useCallback((ev) => {
    const index = ev.target.dataset.draglistindex;
    positionRef.current.toIndex = index;

    const { fromIndex, toIndex } = positionRef.current;
    if (fromIndex !== -1 && toIndex !== -1 && ev.target) {
      const [top, left] = getPlacePosition(ev.target, fromIndex, toIndex);
      dragLineHookObj.place(top, left);
      dragLineHookObj.show();
    }
  }, []);
  
  const onDragOver = handlePreventDefault;
  const onDragLeave = noop;
  const onDrop = useCallback((ev) => {
    const { current } = positionRef;
    const { fromIndex, toIndex } = current;
    current.toIndex = current.fromIndex = -1;
    emitDrop?.(fromIndex, toIndex);
    dragLineHookObj.hidden();
  }, []);

  const handlers = useMemo(() => ({
    onMouseDown,

    onDragStart,
    onDrag,
    onDragEnd,

    onDragEnter,
    onDragOver,
    onDragLeave,
    onDrop,
  }), [
    onMouseDown,
    onDragStart,
    onDrag,
    onDragEnd,
    onDragEnter,
    onDragOver,
    onDrop,
  ]);

  return (
    <div ref={containerRef} style={DRAG_LIST_STYLE}>
      {
        list.map(({ itemProps }, index) => (
          <ItemContainer
            key={index}
            index={index}
            list={list}
            itemProps={itemProps}
            innerProps={{
              'data-draglistindex': index,
              ...handlers,
            }}
          />
        ))
      }
      <DragLine dragLineHookObj={dragLineHookObj} />
    </div>
  )
}
