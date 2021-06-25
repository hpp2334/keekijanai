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
import { useFetchResponse } from '../../util/request';


export interface LoginProps {
  className?: string;
}

interface HaveLogoutedProps {
}
interface HaveLoginedProps {
  user: Auth.LoginedCurrentUser;
  onLogout: () => void;
}

function HaveLogined(props: HaveLoginedProps) {
  const { t } = useTranslation();
  const { user, onLogout } = props;
  const userRsp = useFetchResponse(user);

  return (
    <div className='kkjn__logined'>
      <UserComponent userRsp={userRsp} containerClassName="kkjn__user-indicator" />
      <Popconfirm
        placement="top"
        title={t("CONFIRM_LOGOUT")}
        onConfirm={onLogout}
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
    </div>
  );
}

export const Login = function (props: LoginProps) {
  const { className } = props;
  const { authRsp, logout } = useAuth();

  return (
    <div className={clsx('kkjn__auth', className)}>
      {(() => authRsp.stage === 'pending' || authRsp.stage === 'requesting'
          ? (<UserComponent userRsp={authRsp} containerClassName="kkjn__user-indicator" />)
          : (authRsp.error || !authRsp.data)
            ? (<div>login error</div>)
            : authRsp.data.isLogin
              ? (<HaveLogined user={authRsp.data} onLogout={logout} />)
              : (<HaveLogouted />)
      )()}
    </div>
  )
}
