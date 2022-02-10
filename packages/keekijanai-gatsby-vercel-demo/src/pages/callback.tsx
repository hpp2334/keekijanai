import "reflect-metadata";
import React from "react";
import { KeekijanaiProvider, OAuth2CallbackRedirect } from "@keekijanai/react";

function Callback() {
  return <OAuth2CallbackRedirect />;
}

export default Callback;
