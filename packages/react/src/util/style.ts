import React from "react";
import _ from 'lodash';

export interface StylesProps {
  style?: React.CSSProperties;
  className?: string;
}

function mergeStyle(a: React.CSSProperties | undefined, b: React.CSSProperties | undefined): React.CSSProperties | undefined {
  if (!a) return b;
  if (!b) return a;
  return _.assign(a, b);
}

function mergeClassName(a: string | undefined, b: Array<any> | string | undefined) {
  let finalCls = a ?? '';
  let first = !finalCls;
  if (b) {
    (typeof b === 'string' ? [b] : b).forEach(s => {
      if (s) {
        if (first) {
          finalCls += s;
        } else {
          finalCls += (' ' + s);
        }
        first = false;
      }
    });
  }
  return finalCls || undefined;
}

export function mergeStyles(base: StylesProps | undefined, classNames?: Array<any>, style?: React.CSSProperties) {
  const finalStyle = mergeStyle(base?.style, style);
  const finalClassName = mergeClassName(base?.className, classNames);
  return {
    style: finalStyle,
    className: finalClassName,
  };
}
