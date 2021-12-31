import { useRemote } from "@/common/hooks/useRemote";
import { StateType } from "@/common/state";
import React, { useCallback, useState } from "react";
import { Button, Popover, PopoverProps } from "./reexport-mui";

export interface ConfirmPopoverProps extends Pick<PopoverProps, "anchorOrigin" | "transformOrigin"> {
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

const defaultState: State = {
  open: false,
  el: null,
};

export const ConfirmPopover: React.ComponentType<ConfirmPopoverProps> = ({
  trigger,
  anchorOrigin,
  transformOrigin,
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
      <Popover
        open={state.open}
        anchorEl={state.el}
        anchorOrigin={anchorOrigin}
        transformOrigin={transformOrigin}
        onClose={handleClickCancel}
      >
        {children}
        <div>
          <Button disabled={okState.type === StateType.Loading} color="inherit" onClick={handleClickCancel}>
            {texts?.cancel ?? "Cancel"}
          </Button>
          <Button disabled={okState.type === StateType.Loading} onClick={handleClickOk}>
            {texts?.ok ?? "Ok"}
          </Button>
        </div>
      </Popover>
    </>
  );
};
