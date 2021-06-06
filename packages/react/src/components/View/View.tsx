import React, { useContext } from 'react'
import { toSearch, withContexts } from '../../util';
import { useView, ViewProvider } from './controller';
import { EyeOutlined } from '@ant-design/icons';
import { Skeleton, Space, Typography } from 'antd';

import './View.css'
import { TranslationContext } from '../../translations';

interface ViewProps {
  /** id，如可取 location.pathname */
  scope: string;
}

export const View = withContexts<ViewProps>(
  TranslationContext,
  ViewProvider,
)(function (props) {
  const viewHookObject = useView();

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
})
