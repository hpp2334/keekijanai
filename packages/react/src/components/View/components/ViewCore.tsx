

import { Skeleton, Typography } from 'antd';
import React from 'react';
import { EyeOutlined } from '@ant-design/icons';
import './ViewCore.scss'

interface ViewCoreProps {
  view: number;
}

export function ViewError() {
  return (
    <>NULL</>
  )
}

export function ViewLoading () {
  return (
    <div className="kkjn__view">
      <EyeOutlined />
      <Skeleton.Input active style={{ width: '50px' }} size='small' />
    </div>
  )
}

export const ViewCore = function (props: ViewCoreProps) {
  const {
    view
  } = props;
  return (
    <div className="kkjn__view">
      <EyeOutlined />
      <div className="kkjn__count">
        <Typography.Text>
          {view}
        </Typography.Text>
      </div>
    </div>
  )
}
