import { styled, useTheme } from "@/components";
import Color from "color";
import { useMemo } from "react";

export interface ToolbarButtonProps {
  icon: React.ReactElement;
  active?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

const Button = styled("button")(({ theme }) => ({
  outline: "none",
  border: "none",
  backgroundColor: "white",
  cursor: "pointer",
}));

export const ToolbarButton = ({ icon, active, className, style, onClick }: ToolbarButtonProps) => {
  const theme = useTheme();

  const sx = useMemo(() => {
    const color = active ? theme.palette.primary.main : theme.palette.grey[500];
    return {
      color,
      "&:hover": {
        color: Color(color).darken(0.2).hex(),
      },
    };
  }, [active, theme.palette.grey, theme.palette.primary.main]);

  return (
    <Button sx={sx} style={style} className={className} onClick={onClick}>
      {icon}
    </Button>
  );
};
