import { ArticleService } from 'keekijanai-client-core';
import _ from 'lodash';
import React from 'react';
import { useContext } from 'react';
import { useMemo } from 'react';
import { useState } from 'react';

interface ArticleContextValue {
  articleService: ArticleService;
}

interface ArticleContextProps {
  children?: React.ReactNode;
}

const articleContext = React.createContext<ArticleContextValue | null>(null);

export function ArticleContext(props: ArticleContextProps) {
  const {
    children,
  } = props;

  const [articleService] = useState(new ArticleService());

  const ctxValue = useMemo(() => ({
    articleService,
  }), [articleService]);

  return (
    <articleContext.Provider value={ctxValue}>
      {children}
    </articleContext.Provider>
  )
}

export function useArticleService() {
  const ctx = useContext(articleContext);
  
  if (!ctx) {
    throw Error('Context value is null. You forgot to wrap component with ArticleContext?');
  }

  return ctx.articleService;
}
