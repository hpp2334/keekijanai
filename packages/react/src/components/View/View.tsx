import React, { useContext } from 'react'
import { toSearch } from '../../util';
import { useView } from './controller';
import { EyeOutlined } from '@ant-design/icons';
import { Skeleton, Space, Typography } from 'antd';

import './View.css'

interface ViewProps {
  scope: string;
}

export function View(props: ViewProps) {
  const { scope } = props;
  const viewHookObject = useView(scope);

  return (
    <div className="kkjn__view">
      <EyeOutlined />
      <div className="kkjn__count">
        {viewHookObject.loading === 'loading' && <Skeleton.Input active style={{ width: '50px' }} size='small' />}
        {viewHookObject.loading === 'done' && viewHookObject.view !== undefined && (
          <Typography.Text>
            {viewHookObject.view}
          </Typography.Text>
        )}
      </div>
    </div>
  )
}
