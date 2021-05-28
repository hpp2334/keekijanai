import React from 'react';
import { Context } from 'keekijanai-react';

export const wrapRootElement = ({ element }) => {
  return (
    <Context>
      {element}
    </Context>
  )
}
