import styles from "./code.module.scss";
import { useSwitch } from "@/common/helper";
import { CollapseCore, Fade, IconButton, Stack, Tooltip } from "@/components";
import React, { useCallback, useState } from "react";
import { useInternalCodeContext } from "./InternalCodeContext";
import { TransitionGroup } from "react-transition-group";
import { MdContentCopy, MdCheck, MdOutlineCode } from "react-icons/md";
import { injectCSS } from "@/common/styles";

export interface CodeSourcesControllerProps {
  children?: React.ReactNode;
}

enum CopyState {
  Idle,
  Success,
}

const CodeSourcesControllerRoot = injectCSS("div", styles.codeSourcesControllerRoot);
const CodeSourcesControllerBar = injectCSS(Stack, styles.codeSourcesControllerBar);
export const CodeSourcesController = ({ children }: CodeSourcesControllerProps) => {
  const { codeService } = useInternalCodeContext();
  const switchHook = useSwitch();

  const [copyState, setCopyState] = useState(CopyState.Idle);

  const handleCopy = useCallback(() => {
    if (copyState === CopyState.Idle) {
      codeService.copyCode().then((success) => {
        setCopyState(CopyState.Success);
        setTimeout(() => {
          setCopyState(CopyState.Idle);
        }, 2000);
      });
    }
  }, [codeService, copyState]);

  return (
    <CodeSourcesControllerRoot>
      <CodeSourcesControllerBar direction="row" justifyContent="space-between">
        <Stack>
          <Fade in={switchHook.isOpen}>
            {switchHook.isOpen && (
              <Tooltip title="Copy" placement="top">
                <IconButton onClick={handleCopy}>
                  {copyState === CopyState.Idle && <MdContentCopy fontSize="inherit" />}
                  {copyState === CopyState.Success && <MdCheck fontSize="inherit" />}
                </IconButton>
              </Tooltip>
            )}
          </Fade>
        </Stack>
        <Stack>
          <IconButton onClick={switchHook.toggle} active={switchHook.isOpen}>
            <MdOutlineCode fontSize="inherit" />
          </IconButton>
        </Stack>
      </CodeSourcesControllerBar>
      <CollapseCore expand={switchHook.isOpen}>{children}</CollapseCore>
    </CodeSourcesControllerRoot>
  );
};
