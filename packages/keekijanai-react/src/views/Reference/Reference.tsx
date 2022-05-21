import styles from "./reference.module.scss";
import React from "react";
import { Typography, Link } from "@/components";
import { withCSSBaseline } from "@/common/hoc/withCSSBaseline";
import { injectCSS } from "@/common/styles";

export interface ReferenceProps {
  entries: Array<[string, string | undefined]>;
  noHeader?: boolean;
}

const ReferenceHeaderTitle = injectCSS(Typography, styles.referenceHeaderTitle);
const ReferenceList = injectCSS("ul", styles.referenceList);
const ReferenceItem = injectCSS("li", styles.referenceListItem);
const ReferenceContainer = injectCSS("div", styles.referenceContainer);
const ReferenceRoot = injectCSS("div", styles.referenceRoot);

const withFeature = withCSSBaseline;

export const Reference = withFeature(({ entries, noHeader = false }: ReferenceProps) => {
  return (
    <ReferenceRoot>
      <ReferenceContainer>
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
      </ReferenceContainer>
    </ReferenceRoot>
  );
});
