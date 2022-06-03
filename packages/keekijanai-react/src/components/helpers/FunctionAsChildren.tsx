import React from "react";

export interface FunctionAsChildrenProps {
  children: () => React.ReactElement;
}

export const FunctionAsChildren = ({ children }: FunctionAsChildrenProps) => {
  return children();
};
