import React from "react";
import { ArticleListWhereParams } from "keekijanai-client-core";
import { ArticleList, ArticleListCore, ArticleListError, ArticleListLoading } from "./ArticleList";
import { Button, Typography } from "antd";
import { ArticleRead } from "./ArticleRead";
import { useState } from "react";
import { Article } from "../../../../../type/dist";
import { ArticleEdit } from "./ArticleEdit";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { withComponentsFactory } from "../../../util/hoc";
import { TranslationContext } from "../../../translations";
import { ArticleContext, useArticleService } from "../controllers/context";
import _ from "lodash";
import Modal from "../../../ui/Modal";
import { useRequest } from "../../../core/request";

import './ArticleView.scss';

interface ArticleViewProps {
  scope?: string;
  where: ArticleListWhereParams;
  header?: string | React.ReactNode;
  take?: number;
}

export let ArticleView = (props: ArticleViewProps) => {
  const { scope, header, where, take = 10 } = props;
  const { t } = useTranslation();

  const articleService = useArticleService();

  const {
    data: articleList,
    loading,
    error,
    pagination,
    run,
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

  const reqRemove = useRequest(
    'mutate',
    (id: number) => articleService.delete(id),
    {
      onSuccess: () => {
        pagination.change(1);
        run();
      },
    }
  );

  const handleClickRemoveItem = useCallback((item: Article.Get) => {
    reqRemove.run(item.id);
  }, [reqRemove.run]);

  const [readModalState, setReadModalState] = useState<{
    open: boolean;
    article: Article.Get | null;
  }>({
    open: false,
    article: null,
  });
  const [editModalState, setEditModalState] = useState<{
    open: boolean;
    article: Article.Get | undefined | null;
  }>({
    open: false,
    article: null,
  });

  const handleReadShow = useCallback((article: Article.Get) => {
    setReadModalState({ article, open: true });
  }, []);

  const handleReadHide = useCallback(() => {
    setReadModalState((prev) => ({ ...prev, open: false }));
  }, []);

  const handleEditShow = useCallback((article: Article.Get | undefined) => {
    setEditModalState({ article, open: true });
  }, []);

  const handleEditHide = useCallback(() => {
    setEditModalState((prev) => ({ ...prev, open: false }));
  }, []);

  const handleEditAfterSubmitSuccess = useCallback(() => {
    setEditModalState({ article: null, open: false });
    pagination.change(1);
    run();
  }, [pagination.change, run]);

  return (
    <div className="kkjn__article-view">
      <div className="kkjn__header">
        <>
          {typeof header !== "string" ? (
            header
          ) : (
            <Typography.Title className="kkjn__title" level={2}>{header}</Typography.Title>
          )}
        </>
        <div>
          <Button type="primary" onClick={_.partial(handleEditShow, undefined)}>
            {t("CREATE_ARTICLE")}
          </Button>
        </div>
      </div>
      <>
        {error && <ArticleListError error={error} />}
        {!articleList && loading && <ArticleListLoading />}
        {articleList && !error && <ArticleListCore
          articleList={articleList}
          loading={loading}
          pagination={pagination.toAntd('small')}
          onClickItem={handleReadShow}
          panel={{
            onClickItemEdit: handleEditShow,
            onClickItemRemove: handleClickRemoveItem,
            removing: reqRemove.loading,
          }}
        />}
      </>
      <Modal visible={readModalState.open} onCancel={handleReadHide} className='kkjn__article-view-modal'>
        {readModalState.article !== null && (
          <ArticleRead id={readModalState.article.id} />
        )}
      </Modal>
      <Modal visible={editModalState.open} onCancel={handleEditHide} className='kkjn__article-view-modal'>
        {editModalState.article !== null && (
          <ArticleEdit
            scope={scope}
            article={editModalState.article}
            onSubmit={handleEditAfterSubmitSuccess}
            onCancel={handleEditHide}
          />
        )}
      </Modal>
    </div>
  );
};

ArticleView = withComponentsFactory(
  TranslationContext,
  ArticleContext
)(ArticleView);
