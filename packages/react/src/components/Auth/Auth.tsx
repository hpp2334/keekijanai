import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useForceUpdate } from '../../util';
import { useAuth } from './controller';
import { auth as authService } from 'keekijanai-client-core';
import { Auth } from 'keekijanai-type';
import { Button, Popconfirm } from 'antd';

import './Auth.css';
import { authModal } from './AuthModal';
import { UserComponent } from '../User/UserComponent';
import clsx from 'clsx';


export interface LoginProps {
  className?: string;
}

interface HaveLogoutedProps {
  user: Auth.CurrentUser;
}
interface HaveLoginedProps {
  user: Auth.CurrentUser;
  loading: 'loading' | 'done' | 'error';
  forceUpdate: () => void;
}

function HaveLogined(props: HaveLoginedProps) {
  const { t } = useTranslation();
  const { user, loading, forceUpdate } = props;
  const composedUserHO = useMemo(() => {
    if (!user.isLogin) {
      return {
        loading,
        user: undefined,
      }
    }
    return {
      loading,
      user,
    }
  }, [user]);

  const handleLogout = () => {
    authService.logout();
    forceUpdate();
  };

  return (
    <div className='kkjn__logined'>
      <UserComponent user={user.isLogin ? user : undefined} loading={loading} containerClassName="kkjn__user-indicator" />
      <Popconfirm
        placement="top"
        title={t("CONFIRM_LOGOUT")}
        onConfirm={handleLogout}
        okText={t("YES")}
        cancelText={t("NO")}
      >
        <Button disabled={loading === 'loading'} size='small'>{t("LOGOUT")}</Button>
      </Popconfirm>
    </div>
  );
}

function HaveLogouted(props: HaveLogoutedProps) {
  const { t } = useTranslation();

  return (
    <div>
      <Button size='small' onClick={authModal.open}>{t("LOGIN")}</Button>
    </div>
  );
}

export function Login(props: LoginProps) {
  const { className } = props;
  const forceUpdate = useForceUpdate();
  const { user, loading } = useAuth();

  return (
    <div className={clsx('kkjn__auth', className)}>
      {
        (user.isLogin || loading === 'loading')
          ? <HaveLogined user={user} loading={loading} forceUpdate={forceUpdate} />
          : <HaveLogouted user={user} />
      }
    </div>
  )
}
