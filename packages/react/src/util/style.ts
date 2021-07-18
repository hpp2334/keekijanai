import React from "react";
import _ from 'lodash';

export interface StylesProps {
  style?: React.CSSProperties;
  className?: string;
}

function mergeStyle(a: React.CSSProperties | undefined | null, b: React.CSSProperties | undefined | null): React.CSSProperties | undefined {
  if (!a) return b ?? undefined;
  if (!b) return a ?? undefined;
  return _.assign(a, b);
}

function handleClass(cls: Array<any> | string | undefined | null) {
  let first = true;
  let finalCls = '';
  if (cls) {
    (typeof cls === 'string' ? [cls] : cls).forEach(s => {
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

function mergeClassName(a: Array<any> | string | undefined | null, b: Array<any> | string | undefined) {
  let fa = handleClass(a);
  let fb = handleClass(b);
  return handleClass([fa, fb]);
}

export function mergeStyles(base: StylesProps | undefined | null, classNames?: Array<any>, style?: React.CSSProperties) {
  const finalStyle = mergeStyle(base?.style, style);
  const finalClassName = mergeClassName(base?.className, classNames);
  return {
    style: finalStyle,
    className: finalClassName,
  };
}

export function mergeStylesLeft(classNames: Array<any> | string | undefined | null, style?: React.CSSProperties | null, extra?: StylesProps) {
  const finalStyle = mergeStyle(style, extra?.style);
  const finalClassName = mergeClassName(classNames, extra?.className);
  return {
    style: finalStyle,
    className: finalClassName,
  };
}