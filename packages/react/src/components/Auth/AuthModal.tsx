import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GithubOutlined, LockOutlined, UserOutlined } from '@ant-design/icons';
import { Typography, Button, Form, Input, Row, Col, notification } from 'antd';
import joi from 'joi';
import _ from 'lodash';

import './AuthModal.css'
import { singletonModalManager } from '../Base/SingletonModal';
import { useAuth, useLegacyAuth } from './controller';
import { AuthService } from 'keekijanai-client-core';
import { TranslationContext } from '../../translations';
import { handleStopPropagation, useRequestState, withContexts } from '../../util';
import { useForm } from 'antd/lib/form/Form';

export interface Options {
  enableLegacyAuth: boolean;
  enableOAuth2: string[];
}

interface OAuth2Props {
  providers: string[];
}

interface LegacyAuthProps {
  onChangeMode: (mode: 'auth' | 'register') => void;
  onClose: () => void;
}

interface LegacyRegisterProps {
  onChangeMode: (mode: 'auth' | 'register') => void;
}

type AuthComponentProps = Options & {
  onClose: () => void;
}

const optionsSchema = joi.object({
  enableLegacyAuth: joi.boolean().default(false),
  enableOAuth2: joi.array().items(joi.string()).default(['github'])
});

let _options: Options = null as any;

/** should be called before render */
export const init = (options?: Partial<Options>) => {
  const { error, value } = optionsSchema.validate(options);
  if (error) {
    throw error;
  }
  _options = value;
}

/** @description open auth modal (rely on browser) */
export const authModal = singletonModalManager.register(SingletonAuthComponent);

function OAuth2(props: OAuth2Props) {
  const { providers: providerList } = props;
  const providers = useMemo(() => Object.fromEntries(providerList.map(t => [t, true])), []);
  const { oauth } = useAuth();
  
  const handleLogin = useCallback((provider: string) => {
    oauth(provider);
  }, [oauth])

  return (
    <div>
      {providers.github && <Button size='large' onClick={_.partial(handleLogin, 'github')}>Continue with Github <GithubOutlined /></Button>}
    </div>
  )
}

function LegacyAuth(props: LegacyAuthProps) {
  const [form] = useForm();
  const { onChangeMode, onClose } = props;
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const legacyAuthHook = useLegacyAuth();

  const onFinish = useCallback((values: any) => {
    const { userID, password } = values;

    setLoading(true);
    legacyAuthHook
      .auth(userID, password)
      .subscribe({
        next: () => {
          setLoading(false);
          onClose();
        },
        error: (err) => {
          setLoading(false);
          notification.error({
            message: err?.response?.error ?? err,
          });
        }
      })
  }, []);

  return (
    <Form className="kkjn__auth-form" form={form} onFinish={onFinish}>
      <Form.Item name="userID" rules={[{ required: true }]}>
        <Input prefix={<UserOutlined />} placeholder={t("USER_ID")} />
      </Form.Item>
      <Form.Item name="password" rules={[{ required: true }]}>
        <Input prefix={<LockOutlined />} type='password' placeholder={t("PASSWORD")} />
      </Form.Item>
      <Form.Item>
        <Button loading={loading} className="kkjn__auth-button" type="primary" htmlType="submit">
          {t("LOGIN")}
        </Button>
        <span>
          {"or "}
          <Typography.Link onClick={_.partial(onChangeMode, 'register')}>
            {t("REGISTER")}
          </Typography.Link>
        </span>
      </Form.Item>
    </Form>
  )
}

function LegacyRegister(props: LegacyRegisterProps) {
  const { onChangeMode } = props;
  const [form] = useForm();
  const { t } = useTranslation();
  const legacyAuthHook = useLegacyAuth();
  const [loading, setLoading] = useState(false);

  const onFinish = useCallback((values: any) => {
    const { userID, password } = values;

    setLoading(true);
    legacyAuthHook
      .register(userID, password)
      .subscribe({
        next: () => {
          setLoading(false);
          onChangeMode('auth');
          notification.success({
            message: t("REGISTER_SUCCESSFULLY"),
          })
        },
        error: (err) => {
          setLoading(false);
          notification.error({
            message: err?.response?.error ?? err,
          });
        }
      })
  }, []);

  return (
    <Form className="kkjn__auth-form" form={form} onFinish={onFinish}>
      <Form.Item name="userID" rules={[{ required: true }]}>
        <Input prefix={<UserOutlined />} placeholder={t("USER_ID")} />
      </Form.Item>
      <Form.Item name="password" rules={[{ required: true }]}>
        <Input prefix={<LockOutlined />} type='password' placeholder={t("PASSWORD")} />
      </Form.Item>
      <Form.Item
        name="password-confirm"
        dependencies={['password']}
        hasFeedback
        rules={[
          {
            required: true,
            message: 'Please confirm your password!',
          },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('password') === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error('The two passwords that you entered do not match!'));
            },
          }),
        ]}
      >
        <Input prefix={<LockOutlined />} type='password' placeholder={t("PASSWORD_CONFIRM")} />
      </Form.Item>
      <Form.Item>
        <Button className="kkjn__auth-button" loading={loading} type="primary" htmlType="submit">
          {t("REGISTER")}
        </Button>
        <span>
          {"or "}
          <Typography.Link onClick={_.partial(onChangeMode, 'auth')}>
            {t("Login")}
          </Typography.Link>
        </span>
      </Form.Item>
    </Form>
  )
}

const AuthComponent = withContexts<AuthComponentProps>(
  TranslationContext,
)(function (props) {
  const { onClose, enableLegacyAuth, enableOAuth2: providers } = props;
  const [mode, setMode] = useState<'auth' | 'register'>('auth');
  const { t } = useTranslation();
  const enableOAuth2 = providers.length > 0;

  return (
    <div className='kkjn__auth-modal' onClick={onClose}>
      <div className='kkjn__container-inner' onClick={handleStopPropagation}>
        {mode === 'auth' && (
          <>
            <div className="kkjn__header">
              <Typography.Text className="kkjn__text">{t("LOGIN_TO_CONTINUE")}</Typography.Text>
            </div>
            {enableLegacyAuth && <LegacyAuth onChangeMode={setMode} onClose={onClose} />}
            {enableOAuth2 && <OAuth2 providers={providers} />}
          </>
        )}
        {mode === 'register' && (
          <>
            <div className="kkjn__header">
              <Typography.Text className="kkjn__text">{t("REGISTER")}</Typography.Text>
            </div>
            {enableLegacyAuth && <LegacyRegister onChangeMode={setMode} />}
          </>
        )}
      </div>
    </div>
  )
})

function SingletonAuthComponent() {
  return (
    <AuthComponent
      onClose={authModal.close}
      {..._options}
    />
  )
}
