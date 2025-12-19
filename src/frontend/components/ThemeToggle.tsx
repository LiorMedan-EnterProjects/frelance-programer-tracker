"use client";

import { useTheme } from "@mui/material/styles";
import { useThemeContext } from "@/frontend/context/ThemeContext";
import IconButton from "@mui/material/IconButton";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import Tooltip from "@mui/material/Tooltip";

export default function ThemeToggle() {
    const theme = useTheme();
    const { toggleColorMode } = useThemeContext();

    return (
        <Tooltip title={theme.palette.mode === 'dark' ? "עבור למצב אור" : "עבור למצב חושך"}>
            <IconButton sx={{ ml: 1 }} onClick={toggleColorMode} color="inherit">
                {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
        </Tooltip>
    );
}
