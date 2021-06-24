import { mergeStyles, StylesProps } from "../../util/style";

import './Button.css';

interface ButtonProps extends StylesProps {
  prefix?: React.ReactNode;
  label?: string;
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

export default function Button(props: ButtonProps) {
  const {
    prefix,
    label,
    disabled,
    onClick
  } = props;

  return (
    <button
      type='button'
      onClick={onClick}
      disabled={disabled}
      {...mergeStyles(
        props,
        [
          "kkjn__button",
          disabled && "kkjn__disabled",
        ]
      )}
    >
      {prefix ?? null}
      {label?.toUpperCase() ?? null}
    </button>
  )
}