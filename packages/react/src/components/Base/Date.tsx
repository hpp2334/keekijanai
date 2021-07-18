import { Typography } from 'antd';
import { format } from 'date-fns-tz';
import React from 'react'
import { mergeStyles, mergeStylesLeft, StylesProps } from '../../util/style';

interface DateTextProps extends StylesProps {
  timestamp: number;
}

export function DateText(props: DateTextProps) {
  const { timestamp } = props;
  return (
    <Typography.Text {...mergeStylesLeft(undefined, undefined, props)}>
      {format(timestamp, 'yyyy-MM-dd HH:mm:ss')}
    </Typography.Text>
  )
}
