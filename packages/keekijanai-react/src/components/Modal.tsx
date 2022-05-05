import { CommonStylesProps } from "@/common/styles";
import ModalUnstyled, { ModalUnstyledProps } from "@mui/base/ModalUnstyled";
import clsx from "clsx";
import React from "react";

import styles from "./modal.module.scss";
import { Fade } from "./transitions/Fade";

interface BackdropProps extends CommonStylesProps {
  open?: boolean;
  children?: React.ReactNode;
}

interface ModalProps {
  open: boolean;
  onClose?: ModalUnstyledProps["onClose"];
  children: ModalUnstyledProps["children"];
}

const Backdrop = React.forwardRef<HTMLDivElement, BackdropProps>(function Backdrop(
  { open, className, style, children, ...otherProps },
  ref
) {
  return (
    <div
      ref={ref}
      className={clsx({ "MuiBackdrop-open": open }, styles.backdropRoot, className)}
      style={style}
      {...otherProps}
    >
      {children}
    </div>
  );
});

const modalClasses = {
  root: styles.modalRoot,
};

export function Modal({ open, children, onClose }: ModalProps) {
  return (
    <ModalUnstyled
      classes={modalClasses}
      open={open}
      onClose={onClose}
      BackdropComponent={Backdrop}
      closeAfterTransition
    >
      <Fade in={open}>{children}</Fade>
    </ModalUnstyled>
  );
}
