import React, { useCallback, useState } from 'react'
import { DragList } from './drag-list';

const INIT_LIST = new Array(20).fill(0).map((_, i) => ({
  itemProps: {
    content: `item ${i}`,
  }
}));

const ITEM_STYLE = {
  padding: '5px',
  backgroudColor: 'gray',
  margin: '3px 2px'
};

function Item({ index, itemProps, innerProps }) {
  return (
    <div {...innerProps} style={ITEM_STYLE}>
      {itemProps.content}
    </div>
  )
}

export default function App() {
  const [list, setList] = useState(INIT_LIST);

  const onDrop = useCallback((fromIndex, toIndex) => {
    setList(list => {
      const nextList = [...list];
      const [item] = nextList.splice(fromIndex, 1);
      nextList.splice(toIndex, 0, item);
      return nextList;
    });
  }, []);

  return (
    <DragList
      onDrop={onDrop}
      list={list}
      ItemContainer={Item}
    />
  )
}
