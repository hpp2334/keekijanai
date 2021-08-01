import React, { useContext } from 'react'
import { useView, ViewContext } from '../controller';
import { EyeOutlined } from '@ant-design/icons';
import { Skeleton, Space, Typography } from 'antd';

import { ViewCore, ViewError, ViewLoading } from '../components';

export interface ViewProps {
  /** id，如可取 location.pathname */
  scope: string;
}

function ViewInner(props: ViewProps) {
  const { scope } = props;

  const { data, error, loading } = useView();

  if (error) {
    return <ViewError />
  }
  if (loading) {
    return <ViewLoading />
  }

  return (
    <ViewContext scope={scope}>
      <ViewCore view={data.view} />
    </ViewContext>
  )
}

export function View(props: ViewProps) {
  const { scope } = props;

  return (
    <ViewContext scope={scope}>
      <ViewInner {...props} />
    </ViewContext>
  )
}
