import React from "react";
import { styled, Paper, Typography, Link } from "@/components";
import { withCSSBaseline } from "@/common/hoc/withCSSBaseline";

export interface ReferenceProps {
  entries: Array<[string, string | undefined]>;
  noHeader?: boolean;
}

const ReferenceHeaderTitle = styled(Typography)(({ theme }) => ({
  fontSize: 24,
  margin: 0,
}));

const ReferenceList = styled("ul")(({ theme }) => ({
  listStyleType: "none",
  paddingLeft: theme.spacing(2),
  margin: `${theme.spacing(1)} 0`,
}));

const ReferenceItem = styled("li")(({ theme }) => ({
  margin: `${theme.spacing(1)} 0`,
  "&:first-child": {
    marginTop: 0,
  },
  "&:last-child": {
    marginBottom: 0,
  },
}));

const ReferencePaper = styled(Paper)(({ theme }) => ({
  padding: `${theme.spacing(1)}`,
}));

export const Reference = withCSSBaseline(({ entries, noHeader = false }: ReferenceProps) => {
  return (
    <ReferencePaper>
      {!noHeader && <ReferenceHeaderTitle>Reference</ReferenceHeaderTitle>}
      <ReferenceList>
        {entries.map((entry, index) => {
          const [title, href] = entry;
          return (
            <ReferenceItem key={index}>
              {title}
              {href && (
                <>
                  :{" "}
                  <Link target="_blank" href={href}>
                    {href}
                  </Link>
                </>
              )}
            </ReferenceItem>
          );
        })}
      </ReferenceList>
    </ReferencePaper>
  );
});
