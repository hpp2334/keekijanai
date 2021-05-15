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
import { authModal } from './AuthModal';
import { UserComponent } from '../User/UserComponent';


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
    <div className='__Keekijanai__Auth__logined_container'>
      <UserComponent userHookObject={composedUserHO} avatarSize={30} containerClassName="__Keekijanai__Auth__logined_user_indicator" />
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
    <div className={className}>
      {
        (user.isLogin || loading === 'loading')
          ? <HaveLogined user={user} loading={loading} forceUpdate={forceUpdate} />
          : <HaveLogouted user={user} />
      }
    </div>
  )
}
