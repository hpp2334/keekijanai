import { Article, Article as ArticleType } from 'keekijanai-type';
import { convertFromRaw, convertToRaw, EditorState } from "draft-js";
import React, { useMemo } from "react";
import { useCallback } from "react";
import { Form, Field } from 'react-final-form';
import { useTranslation } from 'react-i18next';
import { useRequest, createRequestGetReturned, UseRequestGetReturn, UseRequestMutateOpts } from '../../../core/request';
import { map } from 'rxjs/operators';
import _ from 'lodash';
import { Button, Checkbox, Input, Space, Typography } from 'antd';
import { Editor, EditorContainer, EditorToolbar } from '../../Editor';

import './ArticleEdit.scss';
import LoadingDots from '../../../ui/Loading/Dots';
import { useArticleContext } from '../controllers';
import { sprintf } from 'sprintf-js';

interface ArticleEditCoreProps {
  scope?: string;
  articleCoreCreate: ArticleType.CoreCreate;
  upserting: boolean;
  editScopeHide?: boolean;
  onSubmit?: (values: ArticleType.CoreCreate & { scope: string }) => void;
  onCancel?: () => void;
}

interface ArticleEditProps {
  scope?: string;
  article: number | ArticleType.Get | undefined;
  onSubmit?: () => void;
  onCancel?: () => void;
}

const validationRequire = (v: any) => !v && 'FIELD_REQUIRE';

const validationEditorStateRequire = (v: EditorState) => !v.getCurrentContent().hasText() && 'FIELD_REQUIRE';

function FieldError(props: { children?: React.ReactNode }) {
  return (
    <Typography.Text className="kkjn__field-error">
      * {props.children}
    </Typography.Text>
  )
}


export function ArticleEditCore(props: ArticleEditCoreProps) {
  const { scope, articleCoreCreate, editScopeHide, upserting, onSubmit, onCancel } = props;
  const { t } = useArticleContext();

  const initValues = useMemo(() => ({
    scope: scope ?? '',
    title: articleCoreCreate.title ?? '',
    abstract: articleCoreCreate.abstract ?? '',
    content: articleCoreCreate.content
      ? EditorState.createWithContent(convertFromRaw(JSON.parse(articleCoreCreate.content)))
      : EditorState.createEmpty(),
    switchTitle: articleCoreCreate.title !== null,
    switchAbstract: articleCoreCreate.abstract !== null,
  }), [scope, articleCoreCreate.title, articleCoreCreate.abstract, articleCoreCreate.content]);

  const handleSubmit = useCallback((values: typeof initValues) => {
    if (onSubmit) {
      const data = {
        type: 0,
        scope: values.scope,
        title: values.switchTitle ? values.title : null,
        abstract: values.switchAbstract ? values.abstract : null,
        content: JSON.stringify(convertToRaw(values.content.getCurrentContent())),
      };
      onSubmit(data);
    }
  }, [onSubmit]);

  return (
    <Form
      onSubmit={handleSubmit}
      initialValues={initValues}
      render={({ handleSubmit, values }) => (
        <form className="kkjn__article-edit-core" onSubmit={handleSubmit}>
          <div>
            <Field name="switchTitle" component='input' type='checkbox'>
              {props => (
                <Checkbox {...props.input}>{t("INCLUDE_TITLE")}</Checkbox>
              )}
            </Field>
            <Field name="switchAbstract" component='input' type='checkbox'>
              {props => (
                <Checkbox {...props.input}>{t("INCLUDE_ABSTRACT")}</Checkbox>
              )}
            </Field>
          </div>
          {!editScopeHide && (
            <div className='kkjn__space-y'>
              <Field name="scope" component='input' type='text'>
                {({ input, meta }) => (
                  <>
                    <Input {...input} placeholder={t('ARTICLE_SCOPE')} />
                  </>
                )}
              </Field>
            </div>
          )}
          {values.switchTitle && <Field name='title' component='input' type='text' validate={validationRequire}>
            {({ input, meta }) => (
              <div className='kkjn__space-y'>
                <Input {...input} placeholder={t('ARTICLE_TITLE')} />
                {meta.touched && meta.error && <FieldError>{t('translation:' + meta.error)}</FieldError>}
              </div>
            )}
          </Field>}
          {values.switchAbstract && <Field name='abstract' component='textarea' validate={validationRequire}>
            {({ input, meta }) => (
              <div className='kkjn__space-y'>
                <Input.TextArea className='kkjn__textarea' {...input} placeholder={t('ARTICLE_ABSTRACT')} />
                {meta.touched && meta.error && <FieldError>{t('translation:' + meta.error)}</FieldError>}
              </div>
            )}
          </Field>}
          <Field name="content" validate={validationEditorStateRequire}>
            {({ input, meta }) => (
              <>
                <EditorContainer className='kkjn__space-y' value={input.value} onChange={input.onChange}>
                  <EditorToolbar />
                  <Editor />
                </EditorContainer>
                {meta.touched && meta.error && <FieldError>{t('translation:' + meta.error)}</FieldError>}
              </>
            )}
          </Field>
          <div className="kkjn__panel">
            <Space>
              <Button disabled={upserting} onClick={onCancel}>{t('translation:CANCEL')}</Button>
              <Button loading={upserting} type='primary' htmlType='submit'>{t('EDIT_ARTICLE')}</Button>
            </Space>
          </div>
        </form>
      )}
    />
  )
}

// === use Service ===

export function ArticleEdit (props: ArticleEditProps) {
  const { articleService, t }= useArticleContext();
  const _article = props.article;
  const _id = _article && (typeof _article === 'number' ? _article : _article.id);

  const reqUpsert = (() => {
    const opts: UseRequestMutateOpts<any> = {
      onSuccess: () => props.onSubmit?.(),
      notification: {
        template: {
          success: (rsp) => sprintf(t("EDIT_ARTICLE_SUCCESS")),
          error: err => sprintf(t("EDIT_ARTICLE_ERROR"), err),
        }
      }
    }

    return typeof _id !== 'undefined'
      ? useRequest('mutate', (scope: string, payload: Article.CoreCreate) => articleService.updateArticleCore(_id, payload), opts)
      : useRequest('mutate', (scope: string, payload: Article.CoreCreate) => articleService.create({ scope, article: payload }), opts);
  })();

  const { data, error, loading } = ((): UseRequestGetReturn<Article.CoreCreate> => {
    switch (typeof _id) {
      case 'number':
        return useRequest('get', ([id]) => 
          articleService
            .get(id)
            .pipe(
              map(v => v.article),
            ),
          [_id]
        )
      default:
        return createRequestGetReturned({ type: 0, title: '', abstract: '', content: '' })
    }
  })();

  const handleSubmit = useCallback((values: ArticleType.CoreCreate & { scope: string }) => {
    const scope = values.scope;
    const articleCoreCreate = _.pick(values, ['title', 'abstract', 'content', 'type']);
    reqUpsert.run(scope, articleCoreCreate);
  }, [reqUpsert.run]);

  if (error) {
    return (
      <div>
        {error}
      </div>
    )
  }
  if (loading) {
    return (
      <LoadingDots />
    )
  }
  return (
    <ArticleEditCore
      scope={props.scope}
      articleCoreCreate={data}
      upserting={reqUpsert.loading}
      onSubmit={handleSubmit}
      onCancel={props.onCancel}
      editScopeHide={props.scope !== undefined}
    />
  )
}

