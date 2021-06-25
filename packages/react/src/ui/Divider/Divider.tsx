import React from 'react';
import { useMemo } from 'react';
import { mergeStyles, mergeStylesLeft, StylesProps } from '../../util/style';
import './Divider.scss';

interface DividerProps extends StylesProps {
  direction?: 'horizontal' | 'vertical';
}

export default function Divider(props: DividerProps) {
  const { direction } = props;

  const style = useMemo(() => {
    const style: React.CSSProperties =
      direction === undefined || direction === 'horizontal'
      ? {
        width: '100%',
        height: 0,
        borderBottom: '1px solid #eee',
        margin: '5px 0',
      }
      : {
        width: 0,
        height: '100%',
        borderLeft: '1px solid #eee',
        margin: '0 5px',
      };
    return style;
  }, [direction]);

  return (
    <div {...mergeStylesLeft("kkjn__divider", style, props)}>
      
    </div>
  )
}
