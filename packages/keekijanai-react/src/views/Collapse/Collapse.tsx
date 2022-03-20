// modify from https://mui.com/components/accordion/ Customization example

import React, { useRef } from "react";
import ArrowForwardIosSharpIcon from "@mui/icons-material/ArrowForwardIosSharp";
import {
  styled,
  Accordion as MuiAccordion,
  AccordionSummary as MuiAccordionSummary,
  AccordionDetails as MuiAccordionDetails,
  Typography,
  type AccordionProps,
  type AccordionSummaryProps,
} from "@/components";
import { CommonStylesProps } from "@/common/react";
import { useSwitch } from "@/common/helper";

export interface CollapseProps extends CommonStylesProps {
  title: string;
  /** (default: false) */
  defaultExpanded?: boolean;
  children?: React.ReactNode;
}

const Accordion = styled((props: AccordionProps) => <MuiAccordion disableGutters elevation={0} square {...props} />)(
  ({ theme }) => ({
    border: `1px solid ${theme.palette.divider}`,
    "&:before": {
      display: "none",
    },
  })
);

const AccordionSummary = styled((props: AccordionSummaryProps) => (
  <MuiAccordionSummary expandIcon={<ArrowForwardIosSharpIcon sx={{ fontSize: "0.9rem" }} />} {...props} />
))(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, .05)" : "rgba(0, 0, 0, .03)",
  flexDirection: "row-reverse",
  "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": {
    transform: "rotate(90deg)",
  },
  "& .MuiAccordionSummary-content": {
    marginLeft: theme.spacing(1),
  },
}));

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: "1px solid rgba(0, 0, 0, .125)",
}));

export function Collapse({ title, defaultExpanded = false, children, className, style }: CollapseProps) {
  const { isOpen, toggle } = useSwitch(defaultExpanded);
  const haveOpenedRef = React.useRef(isOpen);
  haveOpenedRef.current ||= isOpen;

  return (
    <Accordion expanded={isOpen} onChange={toggle} className={className} style={style}>
      <AccordionSummary>
        <Typography>{title}</Typography>
      </AccordionSummary>
      <AccordionDetails>{haveOpenedRef.current && children}</AccordionDetails>
    </Accordion>
  );
}
