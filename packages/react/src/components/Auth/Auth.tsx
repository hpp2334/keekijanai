import React, { useContext, useMemo, useCallback, useRef, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useForceUpdate, useMemoExports, useSwitch } from '../../util';
import { useAuth } from './controller';
import { auth as authService } from 'keekijanai-client-core';
import { Auth } from 'keekijanai-type';
import { Button, Popconfirm, Typography } from 'antd';
import { GithubOutlined } from '@ant-design/icons';
import { BehaviorSubject } from 'rxjs';

import './Auth.css';
import { Avatar } from '../User';


export interface LoginProps {
  className?: string;
}

interface HaveLogoutedProps {
  user: Auth.CurrentUser;
}
interface HaveLoginedProps {
  user: Auth.CurrentUser;
  forceUpdate: () => void;
}

const authComponentOpen$ = new BehaviorSubject<boolean>(false);
export function useAuthComponent() {
  const [open, setOpen] = useState(authComponentOpen$.value);

  const show = useCallback(() => { authComponentOpen$.next(true) }, []);
  const hide = useCallback(() => { authComponentOpen$.next(false) }, []);

  useEffect(() => {
    authComponentOpen$.subscribe({
      next: setOpen
    });
  }, []);

  const exports = useMemoExports({
    open,
    show,
    hide,
  });
  return exports;
}

export function SingletonAuthComponent() {
  const { t } = useTranslation();
  const { open, hide } = useAuthComponent();

  const handleLogin = (provider: string) => () => {
    authService.oauth(provider);
  }

  const handleStopPropagation = (ev: any) => {
    ev.stopPropagation();
  }

  return !open ? null : (
    <div className='__Keekijanai__Auth__singleton-auth' onClick={hide}>
      <div className='__Keekijanai__Auth__singleton-auth-inner' onClick={handleStopPropagation}>
        <Typography.Title level={3}>{t("CHOOSE_ONE_OF_LOGIN_METHOD")}</Typography.Title>
        <div>
          <Button size='large' onClick={handleLogin('github')}>Continue with Github <GithubOutlined /></Button>
        </div>
      </div>
    </div>
  )
}

function HaveLogined(props: HaveLoginedProps) {
  const { t } = useTranslation();
  const { user, forceUpdate } = props;

  const handleLogout = () => {
    authService.logout();
    forceUpdate();
  };

  if (!user.isLogin) {
    throw Error('User need login. It may be a bug.');
  }

  return (
    <div className='__Keekijanai__Auth__logined_container'>
      <div className='__Keekijanai__Auth__logined_user_indicator'>
        <Avatar user={user} size='30px' />
        <Typography.Text>{user.name}</Typography.Text>
      </div>
      <Popconfirm
        placement="top"
        title={t("CONFIRM_LOGOUT")}
        onConfirm={handleLogout}
        okText={t("YES")}
        cancelText={t("NO")}
      >
        <Button size='small'>{t("LOGOUT")}</Button>
      </Popconfirm>
    </div>
  );
}

function HaveLogouted(props: HaveLogoutedProps) {
  const { t } = useTranslation();
  const { show } = useAuthComponent();

  return (
    <div>
      <Button size='small' onClick={show}>{t("LOGIN")}</Button>
    </div>
  );
}

export function Login(props: LoginProps) {
  const { className } = props;
  const forceUpdate = useForceUpdate();
  const { user } = useAuth();

  return (
    <div className={className}>
      {
        user.isLogin
          ? <HaveLogined user={user} forceUpdate={forceUpdate} />
          : <HaveLogouted user={user} />
      }
    </div>
  )
}
