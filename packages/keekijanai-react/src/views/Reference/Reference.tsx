import React from "react";
import { styled, Paper, Typography } from "@/components";

export interface ReferenceProps {
  entries: Array<[string, string | undefined]>;
}

const ReferenceLink = styled("a")(({ theme }) => ({
  textDecoration: "underline",
  "&:hover": {
    color: theme.palette.primary.main,
  },
}));

const ReferenceItem = styled("li")(({ theme }) => ({
  margin: `${theme.spacing(1)}`,
  "&:first-child": {
    marginTop: 0,
  },
  "&:last-child": {
    marginBottom: 0,
  },
}));

const ReferencePaper = styled(Paper)(({ theme }) => ({
  padding: `${theme.spacing(2)}`,
}));

export const Reference = ({ entries }: ReferenceProps) => {
  return (
    <ReferencePaper>
      <Typography variant="h3" style={{ margin: 0 }}>
        Reference
      </Typography>
      <ul>
        {entries.map((entry, index) => {
          const [title, href] = entry;
          return (
            <ReferenceItem key={index}>
              {title}
              {href && (
                <>
                  :{" "}
                  <ReferenceLink target="_blank" href={href}>
                    {href}
                  </ReferenceLink>
                </>
              )}
            </ReferenceItem>
          );
        })}
      </ul>
    </ReferencePaper>
  );
};
