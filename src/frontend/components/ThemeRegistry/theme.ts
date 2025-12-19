import { createTheme, ThemeOptions } from "@mui/material/styles";
import { Heebo } from "next/font/google";

const heebo = Heebo({
    weight: ["300", "400", "500", "700"],
    subsets: ["hebrew", "latin"],
    display: "swap",
});

const getDesignTokens = (mode: 'light' | 'dark'): ThemeOptions => ({
    direction: 'rtl',
    palette: {
        mode,
        ...(mode === 'light'
            ? {
                // Light mode - Crisp, Professional, Airy
                primary: {
                    main: "#3B82F6", // Royal Blue
                    light: "#60A5FA",
                    dark: "#2563EB",
                },
                secondary: {
                    main: "#475569", // Slate 600
                },
                background: {
                    default: "#F1F5F9", // Slate 100
                    paper: "#FFFFFF",   // Pure White
                },
                text: {
                    primary: "#0F172A", // Slate 900
                    secondary: "#64748B", // Slate 500
                },
                divider: "#E2E8F0", // Slate 200
            }
            : {
                // Dark mode - Deep, Rich, Cyber-inspired
                primary: {
                    main: "#60A5FA", // Blue 400
                    light: "#93C5FD",
                    dark: "#3B82F6",
                },
                secondary: {
                    main: "#94A3B8", // Slate 400
                },
                background: {
                    default: "#0F172A", // Slate 900 (Main Layout BG)
                    paper: "#1E293B",   // Slate 800 (Cards/Sidebar)
                },
                text: {
                    primary: "#F8FAFC", // Slate 50
                    secondary: "#CBD5E1", // Slate 300
                },
                divider: "#334155", // Slate 700
            }),
    },
    typography: {
        fontFamily: heebo.style.fontFamily,
        h1: { fontSize: "2.5rem", fontWeight: 700 },
        h2: { fontSize: "2rem", fontWeight: 600 },
        h3: { fontSize: "1.75rem", fontWeight: 600 },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: "none",
                    borderRadius: 8,
                    fontWeight: 600,
                },
                contained: {
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: '0px 2px 4px rgba(0,0,0,0.2)',
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    backgroundImage: 'none', // Remove default gradient in dark mode
                }
            }
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                }
            }
        }
    },
});

export default getDesignTokens;
