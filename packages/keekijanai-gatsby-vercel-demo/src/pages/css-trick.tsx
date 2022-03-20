import { ArticleLayout, articleRender } from "../article";
import React from "react";

export default function () {
  const belong = "/css-trick";
  const path = belong;

  return <ArticleLayout belong={belong}>{articleRender(path)}</ArticleLayout>;
}
