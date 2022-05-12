/* eslint-disable no-inner-declarations */

import { Alert, AlertTitle } from "@/components";
import React, { useEffect, useMemo } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { GetRenderHandler, GetRenderResult, RenderType, switchAllCaseCheck } from "@keekijanai/frontend-core";
import { useInternalCodeContext } from "./InternalCodeContext";
import { injectCSS } from "@/common/styles";

import styles from "./code.module.scss";

export interface CodeRenderProps {
  /** Get render handler. If in webpack，`require.context` can be used to get render handler */
  getRender: GetRenderHandler;
  entryKey: string;
}

const RenderContainer = injectCSS("div", styles.componentRenderContainer);

function ErrorFallbackComponent({ error }: { error: Error }) {
  return (
    <Alert>
      <AlertTitle>Render Fail</AlertTitle>
      {error.message}
    </Alert>
  );
}

const getRenderedElement = (renderResult: GetRenderResult): React.ReactElement => {
  const { type, key } = renderResult;
  console.debug("[CodeRender]", "[getRenderedElement]", { key });
  switch (type) {
    case RenderType.NotFound: {
      return <ErrorFallbackComponent error={new Error(`not found for key "${key}"`)} />;
    }
    case RenderType.Native: {
      const { html, handler } = renderResult;

      function NativeComponent() {
        useEffect(() => {
          handler();
        }, []);

        return <div dangerouslySetInnerHTML={{ __html: html }} />;
      }

      return (
        <ErrorBoundary FallbackComponent={ErrorFallbackComponent}>
          <RenderContainer>
            <NativeComponent />
          </RenderContainer>
        </ErrorBoundary>
      );
    }
    case RenderType.React: {
      const { Component } = renderResult;

      return (
        <ErrorBoundary FallbackComponent={ErrorFallbackComponent}>
          <RenderContainer>
            <Component />
          </RenderContainer>
        </ErrorBoundary>
      );
    }
  }
  switchAllCaseCheck(renderResult);
};

export const CodeRender = ({ getRender, entryKey }: CodeRenderProps) => {
  const { codeService } = useInternalCodeContext();

  codeService.setGetRender(getRender);

  const codeRenderElement = useMemo(() => {
    const renderResult = codeService.getRenderedElement(entryKey);
    return getRenderedElement(renderResult);
  }, [codeService, entryKey]);

  return <div className={styles.codeRenderRoot}>{codeRenderElement}</div>;
};
