import { styled } from "@mui/material";

export const Link = styled("a")(({ theme }) => ({
  textDecoration: "underline",
  "&:link": {
    color: "inherit",
  },
  "&:visited": {
    color: "inherit",
  },
  "&:hover": {
    color: theme.palette.primary.main,
  },
  "&:activated": {
    color: "inherit",
  },
}));
