"use client";

import { ReactQueryProvider } from "@/features/react-query";
import { PropsWithChildren, type FC } from "react";

export const Providers: FC<PropsWithChildren> = ({ children }) => {
  return (
    <ReactQueryProvider>{children}</ReactQueryProvider>
  );
};
