import { CompressOutlined, CopyOutlined, ExpandOutlined } from '@ant-design/icons'
import { Button, Tooltip } from 'antd'
import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next';
import { TranslationContext } from '../../translations';

interface CodeSourcesToolbarProps {
  isCollapsed: boolean;

  onClickCollapse?: (isCollapsed: boolean) => any;
  onClickCopy?: () => any;
}

export function CodeSourcesToolbar(props: CodeSourcesToolbarProps) {
  const { onClickCollapse, onClickCopy, isCollapsed } = props;
  const { t } = useTranslation();

  const handleClickCollapse = useCallback(() => {
    onClickCollapse?.(isCollapsed);
  }, [onClickCollapse, isCollapsed]);

  const handleClickCopy = useCallback(() => {
    onClickCopy?.();
  }, [onClickCopy]);

  return (
    <TranslationContext>
      <div className="kkjn__panel">
        {!isCollapsed && (
          <Tooltip title={t("COPY_CODE")}>
            <Button onClick={handleClickCopy} icon={<CopyOutlined />} type='text' shape='circle' />
          </Tooltip>
        )}
        <Tooltip title={isCollapsed ? t("SHOW_CODE") : t("HIDE_CODE")}>
          <Button onClick={handleClickCollapse} icon={isCollapsed ? <ExpandOutlined /> : <CompressOutlined />} type='text' shape='circle' />
        </Tooltip>
      </div>
    </TranslationContext>
  )
}
