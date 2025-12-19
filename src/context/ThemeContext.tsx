"use client";

import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import getDesignTokens from "@/components/ThemeRegistry/theme";
import { UserProfile } from "@/lib/firestore";
import { useAuth } from "@/context/AuthContext";

interface ThemeContextType {
    mode: 'light' | 'dark';
    toggleColorMode: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
    mode: 'dark',
    toggleColorMode: () => { },
});

export const useThemeContext = () => useContext(ThemeContext);

export const ColorModeProvider = ({ children }: { children: ReactNode }) => {
    // Use a separate mounted state to handle hydration mismatch
    const [mounted, setMounted] = useState(false);
    const [mode, setMode] = useState<'light' | 'dark'>('dark');

    useEffect(() => {
        setMounted(true);
        // Force dark mode default if not set
        const savedMode = localStorage.getItem('themeMode') as 'light' | 'dark';
        if (savedMode) {
            setMode(savedMode);
        } else {
            setMode('dark');
        }
    }, []);

    const colorMode = useMemo(
        () => ({
            mode,
            toggleColorMode: () => {
                setMode((prevMode) => {
                    const newMode = prevMode === 'light' ? 'dark' : 'light';
                    localStorage.setItem('themeMode', newMode);
                    return newMode;
                });
            },
        }),
        [mode]
    );

    const theme = useMemo(() => {
        return createTheme(getDesignTokens(mode));
    }, [mode]);

    // Prevent hydration mismatch by rendering only after mount, 
    // or render with a default structure. For themes, rendering children is usually fine
    // but if the theme changes drastically it might cause layout shift.
    // We'll stick to rendering children always but theme might flicker if we don't block.
    // However, simple approach is best.

    if (!mounted) {
        // Return with default light theme to match server or empty
        // Returning null might be too aggressive for SEO.
        // We will just render with default (light) and let effect update it.
    }

    return (
        <ThemeContext.Provider value={colorMode}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </ThemeProvider>
        </ThemeContext.Provider>
    );
};
