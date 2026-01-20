"use client";

import * as React from "react";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { useMediaQuery } from "@mui/material";
import { lightTheme, darkTheme } from "@/theme/theme";

/* ONE shared cache */
const emotionCache = createCache({
  key: "mui",
  prepend: true, 
});

export default function ThemeRegistry({
  children,
}: {
  children: React.ReactNode;
}) {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)", {
    noSsr: true,
  });

  const theme = React.useMemo(
    () => (prefersDarkMode ? darkTheme : lightTheme),
    [prefersDarkMode],
  );

  return (
    <CacheProvider value={emotionCache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </CacheProvider>
  );
}
