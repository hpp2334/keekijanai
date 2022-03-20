import React from "react";
import { Metadata, RenderContent } from "../../Article";
import { Reference, Collapse, Code, CodeSource } from "@keekijanai/react";

import { Demo, requireRaw } from "./code";

export const metadata: Metadata = {
  title: "CSS Trick",
  path: "/css-trick",
  series: "tricks",
};

export const renderContent: RenderContent = (info, { H1, H2, H3, H4 }) => (
  <article>
    <Reference
      entries={[
        ["npmjs", "https://www.npmjs.com/"],
        ["CSS Tricks", "https://css-tricks.com/"],
      ]}
    />
    <H2>Introduction</H2>
    <p>This article includes common css styles and javascript libraries.</p>
    <H2>Style</H2>
    <H3>Properties</H3>
    <ul>
      <li>
        display
        <ul>
          <li>grid</li>
          <li>flex</li>
          <li>block</li>
          <li>inline</li>
          <li>inline-[grid/flex/block]</li>
        </ul>
      </li>
      <li>
        position
        <ul>
          <li>absolute</li>
          <li>relative</li>
          <li>fix</li>
        </ul>
      </li>
      <li>color</li>
      <li>backgroud-color</li>
      <li>margin</li>
      <li>padding</li>
      <li>border</li>
      <li>
        font-*
        <ul>
          <li>font-family</li>
          <li>font-size</li>
        </ul>
      </li>
    </ul>
    <H3>Demo</H3>
    <Demo
      source={{
        sourceKeyList: ["./css-prop/main.html", "./css-prop/main.css", "./css-prop/main.js"],
      }}
      render={{
        entryKey: "./css-prop/index.js",
      }}
    />
    <Collapse title="Click to show driven code">
      <Code>
        <CodeSource getSource={requireRaw} sourceKey="./css-prop/index.js" />
      </Code>
    </Collapse>
  </article>
);
