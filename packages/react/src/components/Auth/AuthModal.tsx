import React, { useEffect, useState } from 'react';
import { auth as authService } from 'keekijanai-client-core';
import { useTranslation } from 'react-i18next';
import { GithubOutlined } from '@ant-design/icons';
import { Typography, Button } from 'antd';

import './AuthModal.css'
import { openHandlerFactory } from '../Base/SingletonModal';

export function AuthComponent() {
  const { t } = useTranslation();
  const handleLogin = (provider: string) => () => {
    authService.oauth(provider);
  }
  const handleStopPropagation = (ev: any) => { ev.stopPropagation(); }

  return (
    <div className='kkjn__auth-modal' onClick={authModal.close}>
      <div className='kkjn__container-inner' onClick={handleStopPropagation}>
        <div className="kkjn__header">
          <Typography.Text className="kkjn__text">{t("CHOOSE_ONE_OF_LOGIN_METHOD")}</Typography.Text>
        </div>
        <div>
          <Button size='large' onClick={handleLogin('github')}>Continue with Github <GithubOutlined /></Button>
        </div>
      </div>
    </div>
  )
}

export const authModalID = 'keekijanai-auth-modal';

/** @description open auth modal (rely on browser) */
export const authModal = openHandlerFactory(authModalID);
