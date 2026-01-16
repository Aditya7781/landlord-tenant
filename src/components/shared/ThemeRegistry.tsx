'use client';

import * as React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { lightTheme, darkTheme } from '@/theme/theme';
import { useMediaQuery } from '@mui/material';

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
    // Setting noSsr: true ensures this returns the default value (false) 
    // during SSR and hydration, matching the server-side theme.
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)', { noSsr: true });

    const [mounted, setMounted] = React.useState(false);
    React.useEffect(() => {
        setMounted(true);
    }, []);

    const theme = React.useMemo(
        () => (prefersDarkMode ? darkTheme : lightTheme),
        [prefersDarkMode]
    );

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            {/* Prevent flicker by only showing content after theme is resolved 
                or just render normally if you prefer immediate visibility */}
            {/* Use a native div instead of Box to avoid Emotion style injection during hydration */}
            <div style={{ visibility: mounted ? 'visible' : 'hidden' }}>
                {children}
            </div>
        </ThemeProvider>
    );
}
