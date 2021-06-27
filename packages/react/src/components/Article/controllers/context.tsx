import { ArticleService } from 'keekijanai-client-core';
import _ from 'lodash';
import R from 'ramda';
import React from 'react';
import { useContext } from 'react';
import { useMemo } from 'react';
import { useState } from 'react';
import { useMount } from 'react-use';

import { TFunction, useTranslation } from 'react-i18next';
import { addResources } from '../../../core/translation';
import resourcesMap from '../translations';
import { useKeekijanaiContext } from '../../../core/context';

interface ArticleContextValue {
  articleService: ArticleService;
  t: TFunction<string[]>;
}

interface ArticleContextProps {
  children?: React.ReactNode;
}

const articleContext = React.createContext<ArticleContextValue | null>(null);

export function ArticleContext(props: ArticleContextProps) {
  const {
    children,
  } = props;

  const { client } = useKeekijanaiContext();
  const [articleService] = useState(new ArticleService(client));
  const { t } = useTranslation(['article', 'translation']);

  const ctxValue = useMemo(() => ({
    articleService,
    t,
  }), [articleService]);

  useMount(() => {
    addResources('article', resourcesMap);
  });

  return (
    <articleContext.Provider value={ctxValue}>
      {children}
    </articleContext.Provider>
  )
}

export function useArticleContext() {
  const ctx = useContext(articleContext);
  
  if (!ctx) {
    throw Error('Context value is null. You forgot to wrap component with ArticleContext?');
  }

  return ctx;
}
