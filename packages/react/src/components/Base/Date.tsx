import { format } from 'date-fns-tz';
import React from 'react'
import { mergeStyles, StylesProps } from '../../util/style';

interface DateTextProps extends StylesProps {
  timestamp: number;
}

export function DateText(props: DateTextProps) {
  const { timestamp } = props;
  return (
    <div {...mergeStyles(props)}>
      {format(timestamp, 'yyyy-MM-dd HH:mm:ss')}
    </div>
  )
}
