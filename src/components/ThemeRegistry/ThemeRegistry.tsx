"use client";

import * as React from "react";
import NextAppDirEmotionCacheProvider from "./EmotionCache";
import { ColorModeProvider } from "@/context/ThemeContext";

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
    return (
        <NextAppDirEmotionCacheProvider options={{ key: "mui" }}>
            <ColorModeProvider>
                {children}
            </ColorModeProvider>
        </NextAppDirEmotionCacheProvider>
    );
}
