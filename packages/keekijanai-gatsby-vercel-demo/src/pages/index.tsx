import "reflect-metadata";
import React, { useEffect, useState } from "react";
import { AuthAvatar, Star, KeekijanaiProvider, Comment, Stat, OAuth2CallbackRedirect } from "@keekijanai/react";
import "../styles/index.css";

function Index() {
  const belong = "/";

  return (
    <KeekijanaiProvider queryRoute={true}>
      <main>
        <div>
          <div style={{ display: "flex" }}>
            <Star belong={belong} />
            <Stat belong={belong} />
          </div>
          <AuthAvatar />
          <Comment belong={belong} />
        </div>
      </main>
    </KeekijanaiProvider>
  );
}

export default Index;
