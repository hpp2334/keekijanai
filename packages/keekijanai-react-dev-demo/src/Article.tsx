import React from "react";
import { type Series as SeriesType } from "@keekijanai/frontend-core";
import { TOCHeadings } from "@keekijanai/react";
import { KeekijanaiProvider, OAuth2CallbackRedirect, TOCContext, TOC, ReadingProgress } from "@keekijanai/react";
import { BrowserRouter as Router, Routes, Route, Link, useParams } from "react-router-dom";

import * as articleCSS from "./article/css";
import { ArticleReaction } from "./ArticleReaction";

const _ArticleUtils = {
  H1: TOCHeadings.H1,
  H2: TOCHeadings.H2,
  H3: TOCHeadings.H3,
  H4: TOCHeadings.H4,
};

export type ArticleUtils = typeof _ArticleUtils;

export type ArticleProps = {
  path: string;
  children: (utils: ArticleUtils) => React.ReactElement;
};

export const Article = ({}) => {
  return <div>Article</div>;
};

export interface Metadata {
  path: string;
  title: string;
  series?: string | null;
}

export type RenderContent = (
  info: {
    path: string;
    title: string;
    series: SeriesType | null;
  },
  utils: ArticleUtils
) => React.ReactElement;

export interface Article {
  metadata: Metadata;
  renderContent: RenderContent;
}

export const createArticleRender = (articles: Article[]) => {
  const articleMap = Object.fromEntries(articles.map((item) => [item.metadata.path, item]));
  const seriesMap = articles.reduce((res, cur) => {
    const arr = (res[cur.metadata.path] ??= []);
    arr.push(cur);
    return res;
  }, {} as Record<string, Article[] | undefined>);

  const createSeries = (key: string, articles: Article[]): SeriesType => ({
    name: key,
    data: articles.map((item) => ({
      title: item.metadata.title,
      path: item.metadata.path,
    })),
  });

  return function (path: string) {
    const article = articleMap[path];

    if (!article) {
      throw new Error(`article "${path}" not found`);
    }

    const sameSeriesArticles = !article.metadata.series ? undefined : seriesMap[article.metadata.series];

    const series =
      !sameSeriesArticles || sameSeriesArticles.length === 0
        ? null
        : createSeries(article.metadata.path, sameSeriesArticles);

    return article.renderContent(
      {
        path: article.metadata.path,
        title: article.metadata.title,
        series,
      },
      _ArticleUtils
    );
  };
};

export const ArticleLayout = ({ belong, children }: { belong: string; children: React.ReactNode }) => {
  return (
    <div>
      <TOCContext>
        <TOC
          style={{
            position: "fixed",
            right: "20%",
            top: "100px",
            zIndex: 50,
          }}
        />
        <ReadingProgress />
        {children}
      </TOCContext>
      <ArticleReaction belong={belong} />
    </div>
  );
};
