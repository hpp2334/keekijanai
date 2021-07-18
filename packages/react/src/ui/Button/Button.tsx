import { mergeStyles, StylesProps } from "../../util/style";
import { LoadingOutlined } from '@ant-design/icons';
import { Space } from '../../ui/Space';

import './Button.scss';

interface ButtonProps extends StylesProps {
  type?: 'text' | 'contained';
  prefix?: React.ReactNode;
  label?: string;
  disabled?: boolean;
  loading?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

export default function Button(props: ButtonProps) {
  let {
    type = 'text',
    prefix,
    label,
    disabled,
    loading,
    onClick
  } = props;

  if (loading) {
    prefix = <LoadingOutlined />
  }

  return (
    <button
      type='button'
      onClick={onClick}
      disabled={disabled}
      {...mergeStyles(
        props,
        [
          type === 'text' && "kkjn__text-button",
          type === 'contained' && "kkjn__contained-button",
          disabled && "kkjn__disabled",
        ]
      )}
    >
      <Space direction='horizontal' gap='xs'>
        {prefix ?? null}
        {label?.toUpperCase() ?? null}
      </Space>
    </button>
  )
}