import { KeekijanaiProvider, OAuth2CallbackRedirect, TOCContext, TOC } from "@keekijanai/react";
import { BrowserRouter as Router, Routes, Route, Link, useParams } from "react-router-dom";

import * as articleCSS from "./article/css";

import "./global.css";
import { ArticleLayout, createArticleRender } from "./Article";
import { ArticleReaction } from "./ArticleReaction";

const Navs = () => {
  return (
    <div
      style={{
        display: "grid",
        gap: 2,
        gridTemplateColumns: "repeat(4, 1fr)",
      }}
    >
      <Link to="/css-trick">CSS Trick</Link>
    </div>
  );
};

const articleRender = createArticleRender([articleCSS]);

const Main = () => {
  const params = useParams();
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const belong = params.belong!;
  const path = `/${belong}`;

  return (
    <div>
      <Navs />
      <ArticleLayout belong={belong}>{articleRender(path)}</ArticleLayout>
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
            <Route path="/:belong" element={<Main />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </Router>
      </KeekijanaiProvider>
    </div>
  );
};
