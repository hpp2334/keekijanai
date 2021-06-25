import React, { useContext } from 'react'
import { toSearch, withContexts } from '../../util';
import { useView, ViewProvider } from './controller';
import { EyeOutlined } from '@ant-design/icons';
import { Skeleton, Space, Typography } from 'antd';

import './View.css'

interface ViewProps {
  /** id，如可取 location.pathname */
  scope: string;
}

const ViewCore = function () {
  const { viewRsp } = useView();

  return (
    <div className="kkjn__view">
      <EyeOutlined />
      <div className="kkjn__count">
        {(viewRsp.stage === 'requesting' || viewRsp.stage === 'pending') && <Skeleton.Input active style={{ width: '50px' }} size='small' />}
        {viewRsp.stage === 'error' && (
          <Typography.Text>
            NULL
          </Typography.Text>
        )}
        {viewRsp.stage === 'done' && (
          <Typography.Text>
            {viewRsp.data.view}
          </Typography.Text>
        )}
      </div>
    </div>
  )
}

export function View(props: ViewProps) {
  const { scope } = props;

  return (
    <ViewProvider scope={scope}>
      <ViewCore />
    </ViewProvider>
  )
}
