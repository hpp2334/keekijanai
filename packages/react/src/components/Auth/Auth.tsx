import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForceUpdate, withContexts } from '../../util';
import { useAuth } from './controller';
import { Auth } from 'keekijanai-type';
import { Button, Popconfirm } from 'antd';

import './Auth.css';
import { authModal } from './AuthModal';
import { UserComponent } from '../User/UserComponent';
import clsx from 'clsx';
import { TranslationContext } from '../../translations';


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
  const authHook = useAuth();
  const { t } = useTranslation();
  const { user, loading, forceUpdate } = props;

  const handleLogout = () => {
    authHook.logout();
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

export const Login = withContexts<LoginProps>(
  TranslationContext,
)(function (props) {
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
})
