import React from "react";
import "reflect-metadata";
import { KeekijanaiProvider } from "@keekijanai/react";

export const wrapRootElement = ({ element }) => <KeekijanaiProvider queryRoute={true}>{element}</KeekijanaiProvider>;
