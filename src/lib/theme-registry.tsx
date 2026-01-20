"use client";

import * as React from "react";
import { CacheProvider } from "@emotion/react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { createEmotionCache } from "./emotion-cache";
import theme from "@/theme/theme";

const clientSideEmotionCache = createEmotionCache();

export default function ThemeRegistry({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CacheProvider value={clientSideEmotionCache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </CacheProvider>
  );
}
