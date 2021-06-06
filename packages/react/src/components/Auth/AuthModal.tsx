import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GithubOutlined } from '@ant-design/icons';
import { Typography, Button } from 'antd';

import './AuthModal.css'
import { singletonModalManager } from '../Base/SingletonModal';
import { useAuth } from './controller';
import { AuthService } from 'keekijanai-client-core';
import { TranslationContext } from '../../translations';
import { withContexts } from '../../util';

interface AuthComponentProps {
  onClose: () => void;
}

/** @description open auth modal (rely on browser) */
const authModal = singletonModalManager.register(SingletonAuthComponent)

const AuthComponent = withContexts<AuthComponentProps>(
  TranslationContext,
)(function (props) {
  const { onClose } = props;
  const authHook = useAuth();
  const { t } = useTranslation();
  const handleLogin = (provider: string) => () => {
    authHook.oauth(provider);
  }
  const handleStopPropagation = (ev: any) => { ev.stopPropagation(); }

  return (
    <div className='kkjn__auth-modal' onClick={onClose}>
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
})

function SingletonAuthComponent() {
  return (
    <AuthComponent onClose={authModal.close} />
  )
}

export {
  authModal
}