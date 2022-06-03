import styles from "./reference.module.scss";
import React from "react";
import { Typography, Link, Stack } from "@/components";
import { withCSSBaseline } from "@/common/hoc/withCSSBaseline";
import { injectCSS } from "@/common/styles";
import { IoBrush } from "react-icons/io5";

export interface ReferenceProps {
  entries: Array<[string, string | undefined]>;
  noHeader?: boolean;
}

const ReferenceHeaderTitle = injectCSS("div", styles.referenceHeaderTitle);
const ReferenceList = injectCSS("ul", styles.referenceList);
const ReferenceItem = injectCSS("li", styles.referenceListItem);
const ReferenceItemLink = injectCSS("a", styles.referenceListItemLink);
const ReferenceContainer = injectCSS("div", styles.referenceContainer);
const ReferenceRoot = injectCSS("div", styles.referenceRoot);

const withFeature = withCSSBaseline;

export const Reference = withFeature(({ entries, noHeader = false }: ReferenceProps) => {
  return (
    <ReferenceRoot>
      <ReferenceContainer>
        {!noHeader && (
          <ReferenceHeaderTitle>
            <div className={styles.icon}>
              <IoBrush />
            </div>
            Reference
          </ReferenceHeaderTitle>
        )}
        <ReferenceList>
          {entries.map((entry, index) => {
            const [title, href] = entry;
            return (
              <ReferenceItem key={index}>
                <ReferenceItemLink target="_blank" href={href}>
                  {title}
                </ReferenceItemLink>
              </ReferenceItem>
            );
          })}
        </ReferenceList>
      </ReferenceContainer>
    </ReferenceRoot>
  );
});
