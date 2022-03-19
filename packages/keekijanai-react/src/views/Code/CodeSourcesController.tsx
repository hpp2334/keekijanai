import { useSwitch } from "@/common/helper";
import { Fade, IconButton, Stack, Box, styled, Tooltip, Transitions, Collapse } from "@mui/material";
import React, { useCallback, useState } from "react";
import CodeIcon from "@mui/icons-material/Code";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import { useInternalCodeContext } from "./InternalCodeContext";
import { TransitionGroup } from "react-transition-group";

export interface CodeSourcesControllerProps {
  children?: React.ReactNode;
}

enum CopyState {
  Idle,
  Success,
}

const CodeSourcesControllerBar = styled(Stack)(({ theme }) => ({
  margin: `${theme.spacing(1)} 0`,
}));

export const CodeSourcesController = ({ children }: CodeSourcesControllerProps) => {
  const { codeService } = useInternalCodeContext();
  const switchHook = useSwitch();

  const [copyState, setCopyState] = useState(CopyState.Idle);

  const handleCopy = useCallback(() => {
    codeService.copyCode().then((success) => {
      setCopyState(CopyState.Success);
      setTimeout(() => {
        setCopyState(CopyState.Idle);
      }, 2000);
    });
  }, [codeService]);

  return (
    <div>
      <TransitionGroup>
        <CodeSourcesControllerBar direction="row" justifyContent="space-between">
          <Stack>
            <Fade>
              <>
                {switchHook.isOpen && (
                  <Tooltip title="Copy" placement="top">
                    <IconButton>
                      {copyState === CopyState.Idle && <ContentCopyIcon fontSize="small" onClick={handleCopy} />}
                      {copyState === CopyState.Success && <CheckIcon fontSize="small" />}
                    </IconButton>
                  </Tooltip>
                )}
              </>
            </Fade>
          </Stack>
          <Stack>
            <IconButton onClick={switchHook.toggle}>
              <CodeIcon fontSize="small" />
            </IconButton>
          </Stack>
        </CodeSourcesControllerBar>
        {switchHook.isOpen && (
          <Collapse>
            <div>{children}</div>
          </Collapse>
        )}
      </TransitionGroup>
    </div>
  );
};
