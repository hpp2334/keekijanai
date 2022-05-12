import styles from "../../comment-editor.module.scss";
import clsx from "clsx";

export interface ToolbarButtonProps {
  icon: React.ReactElement;
  active?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

export const ToolbarButton = ({ icon, active, className, style, onClick }: ToolbarButtonProps) => {
  return (
    <button style={style} className={clsx(styles.toolbarButton, active && styles.active, className)} onClick={onClick}>
      {icon}
    </button>
  );
};
