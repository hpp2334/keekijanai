/* eslint-disable @typescript-eslint/no-empty-interface */
import styles from "./menu.module.scss";
import MenuUnstyled, { MenuUnstyledProps } from "@mui/base/MenuUnstyled";
import MenuItemUnstyled, { MenuItemUnstyledProps } from "@mui/base/MenuItemUnstyled";
import PopperUnstyled, { PopperUnstyledProps } from "@mui/base/PopperUnstyled";
import { injectCSS } from "@/common/styles";
import React, { useMemo } from "react";

export interface MenuItemProps extends MenuItemUnstyledProps {}

export interface MenuProps extends MenuUnstyledProps {
  placement?: PopperUnstyledProps["placement"];
}

const StyledPopper = injectCSS(PopperUnstyled, ["keekijanai-reset", styles.popper]);
const StyledListBox = injectCSS("ul", styles.listBox);
const StyledMenuItem = injectCSS(MenuItemUnstyled, styles.menuItem);
const RootMenu = MenuUnstyled;

const menuComponents: MenuProps["components"] = {
  Listbox: StyledListBox,
  Root: StyledPopper,
};

export const MenuItem = React.forwardRef<any, MenuItemProps>(function MenuItem(props, ref) {
  return <StyledMenuItem ref={ref} {...props} />;
});

export const Menu = React.forwardRef<any, MenuProps>(function Menu({ placement, children, ...leftProps }, ref) {
  const componentsProps = useMemo(
    () => ({
      root: {
        placement,
      },
    }),
    [placement]
  );

  return (
    <RootMenu ref={ref} {...leftProps} components={menuComponents} componentsProps={componentsProps}>
      {children}
    </RootMenu>
  );
});
