import React, { useContext } from 'react'
import { toSearch } from '../../util';
import { useView } from './controller';
import { EyeOutlined } from '@ant-design/icons';

interface ViewProps {
  scope: string;
}

export function View(props: ViewProps) {
  const { scope } = props;
  const viewHookObject = useView(scope);

  return (
    <div>
      {viewHookObject.view !== undefined && (
        <>
          <EyeOutlined />
          {viewHookObject.view}
        </>
      )}
    </div>
  )
}
