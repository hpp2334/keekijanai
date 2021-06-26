import React from 'react';
import { mergeStyles, mergeStylesLeft } from '../../util/style';

import './Space.scss';

interface SpaceCommonProps {
  direction?: 'horizontal' | 'vertical';
  children?: React.ReactNode;
}

type SpaceMarginProps = SpaceCommonProps;

type SpaceProps = 
  ({ mode?: 'margin' } & SpaceMarginProps)

function SpaceMargin(props: SpaceMarginProps) {
  const {
    direction = 'vertical',
    children,
  } = props;

  return !children ? null : (
    <div {...mergeStylesLeft(["kkjn__space", direction === 'vertical' ? "kkjn__vertical" : "kkjn__horizontal"])}>
    {
      React.Children.map(children, element => (
        <div
          {...mergeStylesLeft(
          ["kkjn__space-margin-item"]
        )}>{element}</div>
      ))
    }
    </div>
  )
}

export default function Space(props: SpaceProps) {
  switch (props.mode) {
    case 'margin':
      return <SpaceMargin {...props} />
    default:
      return <SpaceMargin {...props} />
  }
}
