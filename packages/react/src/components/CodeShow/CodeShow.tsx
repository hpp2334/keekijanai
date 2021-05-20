import React, { useCallback, useRef, useState } from 'react';
import { CodeEffect, CodeEffectProps } from './CodeEffect';
import { CodeSources, CodeSourcesProps } from './CodeSources';
// @ts-ignore
import { Fade } from 'react-reveal';
import _ from 'lodash';
import { CodeSourcesToolbar } from './CodeSourcesToolbar';

export type CodeShowProps = Omit<CodeEffectProps, 'get'> & Omit<CodeSourcesProps, 'get'> & {
  getExports: CodeEffectProps['get'];
  getRaw: CodeSourcesProps['get'];
}

export function CodeShow(props: CodeShowProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const refSource = useRef<any>(null);
  const codeEffectProps = {
    get: props.getExports,
    entry: props.entry,
    type: props.type,
  };
  const codeSourcesProps = {
    get: props.getRaw,
    nameMap: props.nameMap,
    sourceList: props.sourceList,
  };

  const handleChangeCollapsed = useCallback(() => {
    setIsCollapsed(prev => !prev);
  }, []);
  const handleCopy = useCallback(() => {
    refSource.current?.copy();
  }, []);

  return (
    <div>
      <CodeEffect {...codeEffectProps} />
      <CodeSourcesToolbar onClickCopy={handleCopy} onClickCollapse={handleChangeCollapsed} isCollapsed={isCollapsed}  />
      {!isCollapsed && (
        <Fade>
          <CodeSources refSource={refSource} {...codeSourcesProps} />
        </Fade>
      )}
    </div>
  )
}

export function withCodeShow(getExports: CodeShowProps['getExports'], getRaw: CodeShowProps['getRaw']) {
  return function WrapperCodeShow(props: Omit<CodeShowProps, 'getExports' | 'getRaw'>) {
    return (
      <CodeShow getExports={getExports} getRaw={getRaw} {...props} />
    )
  }
}
