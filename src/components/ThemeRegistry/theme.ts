import { createTheme, ThemeOptions } from "@mui/material/styles";
import { Inter } from "next/font/google";

const inter = Inter({
    weight: ["300", "400", "500", "700"],
    subsets: ["latin"],
    display: "swap",
});

const getDesignTokens = (mode: 'light' | 'dark'): ThemeOptions => ({
    palette: {
        mode,
        ...(mode === 'light'
            ? {
                // Light mode
                primary: {
                    main: "#2563eb", // Vibrant Blue
                },
                secondary: {
                    main: "#0f172a", // Slate 900
                },
                background: {
                    default: "#f8fafc", // Slate 50
                    paper: "#ffffff",
                },
            }
            : {
                // Dark mode
                primary: {
                    main: "#60a5fa", // Sky 400
                },
                secondary: {
                    main: "#94a3b8", // Slate 400
                },
                background: {
                    default: "#0f172a", // Slate 900 (Deep Blue-Grey, Premium Dark)
                    paper: "#1e293b", // Slate 800
                },
                text: {
                    primary: "#f1f5f9", // Slate 100
                    secondary: "#cbd5e1", // Slate 300
                }
            }),
    },
    typography: {
        fontFamily: inter.style.fontFamily,
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
