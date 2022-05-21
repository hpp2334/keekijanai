import React from "react";
import * as articleCSS from "../../../keekijanai-react-dev-demo/src/article/css";

import { createArticleRender, ArticleLayout } from "../../../keekijanai-react-dev-demo/src/Article";
import { ArticleReaction } from "../../../keekijanai-react-dev-demo/src/ArticleReaction";

export const articleRender = createArticleRender([articleCSS]);

export { ArticleReaction, ArticleLayout };
