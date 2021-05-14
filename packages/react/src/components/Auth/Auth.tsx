import React, { useContext, useMemo, useCallback, useRef, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useForceUpdate, useMemoExports, useSwitch } from '../../util';
import { useAuth } from './controller';
import { auth as authService } from 'keekijanai-client-core';
import { Auth } from 'keekijanai-type';
import { Button, Popconfirm, Skeleton, Typography } from 'antd';
import { GithubOutlined } from '@ant-design/icons';
import { BehaviorSubject } from 'rxjs';

import './Auth.css';
import { Avatar } from '../User';
import { authModal, SingletonAuthModal } from './AuthModal';


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

function HaveLogined(props: HaveLoginedProps) {
  const { t } = useTranslation();
  const { user, forceUpdate } = props;
  const composedUserHO = useMemo(() => {
    if (!user.isLogin) {
      return {
        loading: 'loading' as const,
        user: undefined,
      }
    }
    return {
      loading: 'done' as const,
      user,
    }
  }, [user]);

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
        <Avatar userHookObject={composedUserHO} size={30} />
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

  return (
    <div>
      <Button size='small' onClick={authModal.open}>{t("LOGIN")}</Button>
      <SingletonAuthModal />
    </div>
  );
}

export function Login(props: LoginProps) {
  const { className } = props;
  const forceUpdate = useForceUpdate();
  const { user, loading } = useAuth();

  return (
    <div className={className}>
      {loading === 'loading' && <Skeleton.Input style={{ width: '200px' }} size='small' active />}
      {
        loading === 'done' && (user.isLogin
          ? <HaveLogined user={user} forceUpdate={forceUpdate} />
          : <HaveLogouted user={user} />)
      }
    </div>
  )
}
