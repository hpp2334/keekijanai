import React from "react";
import { KeekijanaiProvider } from "@keekijanai/react";

export const wrapRootElement = ({ element }) => <KeekijanaiProvider queryRoute={true}>{element}</KeekijanaiProvider>;
