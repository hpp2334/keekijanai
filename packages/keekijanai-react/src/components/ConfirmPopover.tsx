import styles from "./confirm-popover.module.scss";
import { useRemote } from "@/common/hooks/useRemote";
import { StateType } from "@/common/state";
import React, { useCallback, useState } from "react";
import { Button } from "./Button";
import { Stack } from "./Stack";
import PopperUnstyled, { PopperUnstyledProps } from "@mui/base/PopperUnstyled";
import { injectCSS } from "@/common/styles";

export interface ConfirmPopoverProps extends Pick<PopperUnstyledProps, "placement"> {
  trigger: (openPopover: (el: Element | null) => void) => React.ReactElement;
  onOk: () => Promise<unknown>;
  onCancel?: () => void;
  texts?: {
    cancel?: string;
    ok?: string;
  };
}

interface State {
  open: boolean;
  el: Element | null;
}

const Popper = injectCSS(PopperUnstyled, ["keekijanai-reset", styles.confirmPopoverRoot]);
const ConfirmPopoverContainer = injectCSS("div", styles.confirmPopoverContainer);
const ConfirmPopoverContent = injectCSS("div", styles.confirmPopoverContent);

const defaultState: State = {
  open: false,
  el: null,
};

export const ConfirmPopover: React.ComponentType<ConfirmPopoverProps> = ({
  placement,
  trigger,
  onOk,
  onCancel,
  texts,
  children,
}) => {
  const [state, setState] = useState<State>(defaultState);
  const openPopover = useCallback((el: Element | null) => {
    setState({
      open: true,
      el,
    });
  }, []);

  const [okState, handleOk] = useRemote(onOk);
  const handleCancel = useCallback(() => {
    setState({
      open: false,
      el: null,
    });
    onCancel?.();
  }, [onCancel]);
  const handleClickCancel = useCallback(() => {
    handleCancel();
  }, [handleCancel]);
  const handleClickOk = useCallback(() => {
    handleOk().then(() => {
      handleCancel();
    });
  }, [handleCancel, handleOk]);

  return (
    <>
      {trigger(openPopover)}
      <Popper
        open={state.open}
        anchorEl={state.el}
        placement={placement}
        // onClose={handleClickCancel}
      >
        <ConfirmPopoverContainer>
          <ConfirmPopoverContent>{children}</ConfirmPopoverContent>
          <Stack direction="row" justifyContent="flex-end">
            <Button disabled={okState.type === StateType.Loading} color="inherit" onClick={handleClickCancel}>
              {texts?.cancel ?? "Cancel"}
            </Button>
            <Button disabled={okState.type === StateType.Loading} color="primary" onClick={handleClickOk}>
              {texts?.ok ?? "Ok"}
            </Button>
          </Stack>
        </ConfirmPopoverContainer>
      </Popper>
    </>
  );
};
