import React from "react";
import {
  AuthAvatar,
  Star,
  KeekijanaiProvider,
  Comment,
  Stat,
  OAuth2CallbackRedirect,
  TOCHeadings,
  TOCContext,
  TOC,
  CircularReadingProgress,
  Reference,
} from "@keekijanai/react";
import { BrowserRouter as Router, Routes, Route, Link, useParams } from "react-router-dom";

import "./global.css";

const Navs = () => {
  return (
    <div
      style={{
        display: "grid",
        gap: 2,
        gridTemplateColumns: "repeat(4, 1fr)",
      }}
    >
      <Link to="/p/a1">Scope a1</Link>
      <Link to="/p/ba2">Scope ba2</Link>
    </div>
  );
};

const Main = () => {
  const params = useParams();
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const belong = params.belong!;

  return (
    <div>
      <Navs />
      <TOCContext>
        <TOC className="toc-container" />
        <CircularReadingProgress />

        <article>
          <TOCHeadings.H1>{belong}</TOCHeadings.H1>
          <Reference entries={[["npmjs", "https://www.npmjs.com/"]]} />
          <TOCHeadings.H2>Introduction</TOCHeadings.H2>
          <p>This article includes common css styles and javascript libraries.</p>
          <TOCHeadings.H2>Style</TOCHeadings.H2>
          <TOCHeadings.H3>Properties</TOCHeadings.H3>
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
          <TOCHeadings.H3>Demo</TOCHeadings.H3>
        </article>
      </TOCContext>
      <div style={{ display: "flex" }}>
        <Star belong={belong} />
        <Stat belong={belong} />
      </div>
      <Comment belong={belong} maxHeight={600} headerSuffix={<AuthAvatar />} />
    </div>
  );
};

const Home = () => {
  return (
    <div>
      <Navs />
      Welcome
    </div>
  );
};

const Callback = () => {
  return <OAuth2CallbackRedirect />;
};

export const App = () => {
  return (
    <div style={{ margin: 10 }}>
      <KeekijanaiProvider>
        <Router>
          <Routes>
            <Route path="/callback" element={<Callback />} />
            <Route path="/p/:belong" element={<Main />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </Router>
      </KeekijanaiProvider>
    </div>
  );
};
