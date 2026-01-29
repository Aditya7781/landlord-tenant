"use client";

import * as React from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { useMediaQuery } from "@mui/material";
import { lightTheme, darkTheme } from "@/theme/theme";

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
    <ThemeProvider theme={theme}>
      {/* Delay global CSS injection until after hydration to avoid
          emotion/MUI style mismatches between server and client. */}
      <DelayedCssBaseline>{children}</DelayedCssBaseline>
    </ThemeProvider>
  );
}

function DelayedCssBaseline({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      {mounted ? <CssBaseline /> : null}
      {children}
    </>
  );
}
