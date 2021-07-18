import React from 'react';
import { mergeStyles, mergeStylesLeft, StylesProps } from '../../util/style';

import './Space.scss';

interface SpaceCommonProps extends StylesProps {
  direction?: 'horizontal' | 'vertical';
  gap?: 'xs' | 'sm' | 'md';
  children?: React.ReactNode;
}

type SpaceMarginProps = { mode?: 'margin' } & SpaceCommonProps;

type SpaceProps = SpaceMarginProps

function SpaceMargin(props: SpaceMarginProps) {
  const {
    gap = 'md',
    direction = 'vertical',
    children,
  } = props;

  return !children ? null : (
    <div {...mergeStylesLeft(["kkjn__space", direction === 'vertical' ? "kkjn__vertical" : "kkjn__horizontal"], undefined, props)}>
    {
      React.Children.map(children, element => (
        element === null || element === false
          ? null
          : <div
              {...mergeStylesLeft(
              ["kkjn__space-margin-item", "kkjn__" + gap]
            )}>{element}</div>
      ))
    }
    </div>
  );
}

export default function Space(props: SpaceProps) {
  switch (props.mode) {
    case 'margin':
      return <SpaceMargin {...props} />
    default:
      return <SpaceMargin {...props} />
  }
}
