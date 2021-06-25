import { Article, Article as ArticleType } from 'keekijanai-type';
import { convertFromRaw, EditorState } from "draft-js";
import React, {  } from "react";
import { Typography } from 'antd';
import { useRequest, createRequestGetReturned, UseRequestGetReturn } from '../../../core/request';
import { useArticleContext } from '../controllers/context';
import { EditorContainer, Editor } from '../../Editor';
import { useMemo } from 'react';
import _ from 'lodash';

import './ArticleRead.scss';
import { DateText } from '../../../components/Base/Date';
import { UserComponentV2 } from '../../../components/User/UserComponent';
import LoadingDots from '../../../ui/Loading/Dots';
import { Divider } from '../../../ui';

interface ArticleReadCoreProps {
  article: ArticleType.Get;
}

interface ArticleReadProps {
  id: number;
}

export function ArticleReadCore(props: ArticleReadCoreProps) {
  const { article } = props;
  const { article: articleCore } = article;
  
  const editorState = useMemo(() => articleCore.content
    ? EditorState.createWithContent(convertFromRaw(JSON.parse(articleCore.content)))
    : EditorState.createEmpty(), [articleCore.content]);

  return (
    <div className="kkjn__article-read-core">
      {articleCore.title && (
        <Typography.Title className="kkjn__title" level={1}>{articleCore.title}</Typography.Title>
      )}
      <div className="kkjn__info">
        <UserComponentV2 user={article.creator} />
        <DateText className="kkjn__date-text" timestamp={article.cTime} />
      </div>
      <Divider />
      {articleCore.abstract && (
        <Typography.Text className="kkjn__abstract">
          {articleCore.abstract}
        </Typography.Text>
      )}
      {articleCore.content && (
        <EditorContainer readOnly={true} value={editorState} onChange={_.noop}>
          <Editor />
        </EditorContainer>
      )}
    </div>
  )
}

// === use Service ===

export function ArticleRead (props: ArticleReadProps) {
  const { articleService } = useArticleContext();
  const { id } = props;

  const { data, error, loading } = useRequest('get', ([id]) => articleService.get(id), [id])

  if (error) {
    return (
      <div>
        {error}
      </div>
    )
  }
  if (loading) {
    return <LoadingDots />
  }
  return (
    <ArticleReadCore
      article={data}
    />
  )
}
