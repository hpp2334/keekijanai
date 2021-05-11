import React, { useContext } from 'react'
import { toSearch } from '../../util';
import { useView } from './controller';
import { EyeOutlined } from '@ant-design/icons';

interface ViewProps {
  slug: string;
}

export function View(props: ViewProps) {
  const { slug } = props;
  const viewHookObject = useView(slug);

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
