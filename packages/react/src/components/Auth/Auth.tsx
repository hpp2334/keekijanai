import React, { useContext, useMemo, useCallback, useRef, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useForceUpdate, useMemoExports, useSwitch } from '../../util';
import { useAuth } from './controller';
import { auth as authService } from 'keekijanai-client-core';
import { Auth } from 'keekijanai-type';
import { Button } from 'antd';
import { GithubOutlined } from '@ant-design/icons';
import { BehaviorSubject } from 'rxjs';


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
    <div className="fixed z-50 w-screen h-screen bg-gray-500 bg-opacity-70" onClick={hide}>
      <div className="relative w-96 inset-2/4 transform -translate-x-2/4 -translate-y-2/4 shadow-lg bg-white p-5" onClick={handleStopPropagation}>
        <h2 className="text-xl text-center">{t("CHOOSE_ONE_OF_LOGIN_METHOD")}</h2>
        <div className="flex my-8 justify-center">
          <Button onClick={handleLogin('github')}>Continue with Github <GithubOutlined /></Button>
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
    <div>
      {user.name}
      <button className="ml-3 text-primary" onClick={handleLogout}>{t("LOGOUT")}</button>
    </div>
  );
}

function HaveLogouted(props: HaveLogoutedProps) {
  const { t } = useTranslation();
  const { show } = useAuthComponent();

  return (
    <div>
      {t("NOT_LOGIN")}
      <button className="ml-3 text-primary" onClick={show}>{t("LOGIN")}</button>
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
