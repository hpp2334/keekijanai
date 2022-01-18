import React from "react";
import { AuthAvatar, Star, KeekijanaiProvider, Comment, Stat, OAuth2CallbackRedirect } from "@keekijanai/react";
import { BrowserRouter as Router, Routes, Route, Link, useParams } from "react-router-dom";

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
      <div style={{ display: "flex" }}>
        <Star belong={belong} />
        <Stat belong={belong} />
      </div>
      <AuthAvatar />
      <Comment belong={belong} />
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
    <div style={{ margin: 100 }}>
      <KeekijanaiProvider>
        <Router>
          <Routes>
            <Route path="/oauth2/callback" element={<Callback />} />
            <Route path="/p/:belong" element={<Main />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </Router>
      </KeekijanaiProvider>
    </div>
  );
};
