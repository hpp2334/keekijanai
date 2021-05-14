import React, { useEffect, useState } from 'react';
import { auth as authService } from 'keekijanai-client-core';
import { useTranslation } from 'react-i18next';
import { GithubOutlined } from '@ant-design/icons';
import { Typography, Button } from 'antd';

import './AuthModal.css'
import { openHandlerFactory, withSingletonModal } from '../Base/SingletonModal';

function AuthComponent() {
  const { t } = useTranslation();
  const handleLogin = (provider: string) => () => {
    authService.oauth(provider);
  }
  const handleStopPropagation = (ev: any) => { ev.stopPropagation(); }

  return (
    <div className='__Keekijanai__Auth_AuthModal_container' onClick={authModal.close}>
      <div className='__Keekijanai__Auth_AuthModal_container-inner' onClick={handleStopPropagation}>
        <Typography.Title level={3}>{t("CHOOSE_ONE_OF_LOGIN_METHOD")}</Typography.Title>
        <div>
          <Button size='large' onClick={handleLogin('github')}>Continue with Github <GithubOutlined /></Button>
        </div>
      </div>
    </div>
  )
}

const authModalID = 'keekijanai-auth-modal';
export const SingletonAuthModal = withSingletonModal(authModalID, <AuthComponent />, true)

/** @description open auth modal (rely on browser) */
export const authModal = openHandlerFactory(authModalID);
