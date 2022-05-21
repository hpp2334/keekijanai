import { GetRenderHandler, GetSourceHandler } from "@keekijanai/frontend-core";
import React from "react";
import { Code } from "./Code";
import { CodeRender, CodeRenderProps } from "./CodeRender";
import { CodeSources, CodeSourcesProps } from "./CodeSources";
import { CodeSourcesController } from "./CodeSourcesController";

export interface CodePresetFullProps {
  render: CodeRenderProps;
  source: CodeSourcesProps;
}

export interface PreBindedCodePresetFullProps {
  render: Omit<CodeRenderProps, "getRender">;
  source: Omit<CodeSourcesProps, "getSource">;
}

export const CodePresetFull = ({ render, source }: CodePresetFullProps) => {
  return (
    <Code>
      <CodeRender {...render} />
      <CodeSourcesController>
        <CodeSources {...source} />
      </CodeSourcesController>
    </Code>
  );
};

export const createPreBindedCodePresetFull = (getRender: GetRenderHandler, getSource: GetSourceHandler) => {
  function PreBindedCodePresetFull(props: PreBindedCodePresetFullProps) {
    return (
      <CodePresetFull
        render={{
          ...props.render,
          getRender,
        }}
        source={{
          ...props.source,
          getSource,
        }}
      />
    );
  }
  return PreBindedCodePresetFull;
};
