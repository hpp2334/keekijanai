import { mergeStyles, StylesProps } from "../../util/style";

import './ToggleButton.css';

interface ToggleButtonProps extends StylesProps {
  prefix?: React.ReactNode;
  label?: string;
  disabled?: boolean;
  active?: boolean;
  onToggle?: React.MouseEventHandler<HTMLButtonElement>;
}

export default function ToggleButton(props: ToggleButtonProps) {
  const {
    prefix,
    label,
    disabled,
    active = false,
    onToggle,
  } = props;

  return (
    <button
      type='button'
      onClick={onToggle}
      disabled={disabled}
      {...mergeStyles(
        undefined,
        [
          "kkjn__toggle-button",
          disabled && "kkjn__disabled",
          active && "kkjn__active",
        ]
      )}
    >
      {prefix ?? null}
      {label?.toUpperCase() ?? null}
    </button>
  )
}