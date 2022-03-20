import React from "react";
import { AuthAvatar, Star, Comment, Stat } from "@keekijanai/react";

export const ArticleReaction = ({ belong }: { belong: string }) => {
  return (
    <>
      <div style={{ display: "flex" }}>
        <Star belong={belong} />
        <Stat belong={belong} />
      </div>
      <Comment belong={belong} maxHeight={600} headerSuffix={<AuthAvatar />} />
    </>
  );
};
