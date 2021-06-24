import React from 'react';
import { Article } from 'keekijanai-type';
import { Button, List, PaginationProps, Popconfirm, Typography } from 'antd';
import { format } from 'date-fns-tz';
import { useCallback } from 'react';
import _ from 'lodash';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useArticleService } from '../controllers/context';
import { ArticleListWhereParams } from 'keekijanai-client-core';
import { useRequest } from '../../../core/request';
import { useTranslation } from 'react-i18next';

import './ArticleList.scss';
import LoadingDots from '../../../ui/Loading/Dots';
import { handleStopPropagation } from '../../../util';

interface ArticleListItemProps {
  article: Article.Get;
  children?: React.ReactNode;
  onClick?: () => void;
}

interface ArticleListCoreProps {
  articleList: Article.Get[];
  loading?: boolean;
  error?: string | null;
  pagination?: PaginationProps;

  onClickItem?: (article: Article.Get) => void;

  panel?: {
    removing?: boolean;
    onClickItemRemove?: (article: Article.Get) => void;
    onClickItemEdit?: (article: Article.Get) => void;
  }
}

interface ArticleListProps {
  where: ArticleListWhereParams;
  take?: number;

  onClickItem?: (article: Article.Get) => void;
  onClickItemEdit?: (article: Article.Get) => void;
}


export function ArticleListItem(props: ArticleListItemProps) {
  const {
    article,
    onClick,
    children,
  } = props;

  return (
    <div className="kkjn__article-list-item" onClick={onClick}>
      <div className="kkjn__row">
        <Typography.Text>{article.article.title ?? ''}</Typography.Text>
        <Typography.Text>{format(article.cTime, 'yyyy-MM-dd HH:mm:ss')}</Typography.Text>
      </div>
      {children}
    </div>
  )
}

export function ArticleListError(props: { error: any }) {
  return (
    <div>
      {props.error}
    </div>
  )
}

export function ArticleListLoading() {
  return (
    <LoadingDots />
  )
}

export function ArticleListCore(props: ArticleListCoreProps) {
  const {
    articleList,
    pagination,
    loading,
    onClickItem,
    panel,
  } = props;
  const { t } = useTranslation();

  return (
    <div className="kkjn__article-list-core">
      <List
        size='small'
        dataSource={articleList}
        pagination={pagination}
        loading={loading}
        renderItem={(item, index) => (
          <List.Item
            key={item.id}
          >
            <ArticleListItem
              article={item}
              onClick={onClickItem && _.partial(onClickItem, item)}
            >
              {panel && (<div className="kkjn__panel" onClick={handleStopPropagation}>
                <Button type='text' disabled={panel.removing} icon={<EditOutlined />}
                  onClick={panel.onClickItemEdit && _.partial(panel.onClickItemEdit, item)} />
                <Popconfirm
                  title={t("READY_TO_REMOVE")}
                  placement='top'
                  onConfirm={panel.onClickItemRemove && _.partial(panel.onClickItemRemove, item)}
                  okText={t("YES")}
                  cancelText={t("NO")}
                >
                  <Button loading={panel.removing} danger={true} type='text' shape='circle' size='small' icon={<DeleteOutlined />}></Button>
                </Popconfirm>
              </div>)}
            </ArticleListItem>
          </List.Item>
        )}
      />
    </div>
  )
}

export function ArticleList(props: ArticleListProps) {
  const {
    onClickItem,
    onClickItemEdit,
  } = props;
  const articleService = useArticleService();

  const { t } = useTranslation();
  const {
    data: articleList,
    loading,
    error,
    pagination,
  } = useRequest('list', (args) => articleService.list({
        where: props.where,
        pagination: args.pagination,
        fields: ['title'],
      }),
      [props.where],
      {
        pagination: {
          page: 1,
          pageSize: props.take ?? 10,
        },
      }
    );

  const reqRemove = useRequest('mutate', (id: number) => articleService.delete(id));

  const handleClickRemoveItem = useCallback((item: Article.Get) => {
    reqRemove.run(item.id);
  }, [reqRemove.run]);

  if (error) {
    return (
      <ArticleListError error={error} />
    )
  }
  if (loading && !articleList) {
    return (
      <ArticleListLoading />
    )
  }
  
  return (
    <ArticleListCore
      articleList={articleList}
      pagination={pagination.toAntd('small')}
      onClickItem={onClickItem}
      panel={{
        onClickItemEdit,
        onClickItemRemove: handleClickRemoveItem,
        removing: reqRemove.loading,
      }}
    />
  );
}
