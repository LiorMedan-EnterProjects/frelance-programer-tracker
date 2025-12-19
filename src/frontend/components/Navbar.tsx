"use client";

import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import LogoutIcon from "@mui/icons-material/Logout";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AssignmentIcon from "@mui/icons-material/Assignment";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LoginIcon from "@mui/icons-material/Login";
import { useAuth } from "@/frontend/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";
import { useTheme } from "@mui/material/styles";

export default function Navbar() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const theme = useTheme();

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = async () => {
        handleClose();
        await logout();
        router.push("/");
    };

    const handleLogin = () => {
        router.push("/login");
    };

    const navItems = [
        { label: "לוח בקרה", path: "/dashboard", icon: <DashboardIcon sx={{ marginBottom: "0px !important", marginRight: 1 }} /> },
        { label: "פרויקטים", path: "/projects", icon: <AssignmentIcon sx={{ marginBottom: "0px !important", marginRight: 1 }} /> },
        { label: "שעון", path: "/timer", icon: <AccessTimeIcon sx={{ marginBottom: "0px !important", marginRight: 1 }} /> },
    ];

    // Determine active tab
    const currentTab = navItems.findIndex(item => pathname === item.path);
    const value = currentTab !== -1 ? currentTab : false;

    return (
        <AppBar position="sticky" color="default" elevation={1} dir="rtl" sx={{ bgcolor: 'background.paper', backgroundImage: 'none' }}>
            <Toolbar sx={{ justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography
                        variant="h6"
                        noWrap
                        component="div"
                        sx={{
                            ml: 4,
                            fontWeight: 'bold',
                            color: 'primary.main',
                            cursor: 'pointer'
                        }}
                        onClick={() => router.push('/')}
                    >
                        מעקב פרילנסרים
                    </Typography>

                    {user && (
                        <Tabs
                            value={value}
                            aria-label="navigation tabs"
                            sx={{
                                '& .MuiTab-root': {
                                    minHeight: 64,
                                    fontSize: '1rem',
                                    fontWeight: 500,
                                    flexDirection: 'row',
                                    gap: 1
                                }
                            }}
                        >
                            {navItems.map((item) => (
                                <Tab
                                    key={item.path}
                                    label={item.label}
                                    icon={item.icon}
                                    iconPosition="start"
                                    onClick={() => router.push(item.path)}
                                />
                            ))}
                        </Tabs>
                    )}
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ThemeToggle />

                    {user ? (
                        <>
                            <IconButton
                                size="large"
                                aria-label="account of current user"
                                aria-controls="menu-appbar"
                                aria-haspopup="true"
                                onClick={handleMenu}
                                color="inherit"
                                sx={{ ml: 1 }}
                            >
                                <Avatar
                                    src={user.photoURL || undefined}
                                    sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}
                                >
                                    {user.displayName?.charAt(0) || <AccountCircleIcon />}
                                </Avatar>
                            </IconButton>
                            <Menu
                                id="menu-appbar"
                                anchorEl={anchorEl}
                                anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'left', // RTL: left aligns to the visual right side of element usually
                                }}
                                keepMounted
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'left',
                                }}
                                open={Boolean(anchorEl)}
                                onClose={handleClose}
                            >
                                <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 200, outline: 'none' }}>
                                    <Avatar
                                        src={user.photoURL || undefined}
                                        sx={{ width: 64, height: 64, mb: 1, bgcolor: 'primary.main' }}
                                    >
                                        {user.displayName?.charAt(0) || <AccountCircleIcon fontSize="large" />}
                                    </Avatar>
                                    <Typography variant="subtitle1" fontWeight="bold">
                                        {user.displayName || 'משתמש'}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        {user.email}
                                    </Typography>
                                    <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.7rem' }}>
                                        UID: {user.uid.substring(0, 8)}...
                                    </Typography>
                                </Box>
                                <MenuItem onClick={handleLogout} sx={{ color: 'error.main', justifyContent: 'center', borderTop: 1, borderColor: 'divider', pt: 1 }}>
                                    <LogoutIcon fontSize="small" sx={{ ml: 1 }} />
                                    התנתק
                                </MenuItem>
                            </Menu>
                        </>
                    ) : (
                        <Button
                            color="primary"
                            variant="contained"
                            startIcon={<LoginIcon sx={{ ml: 1 }} />}
                            onClick={handleLogin}
                            sx={{ borderRadius: 2 }}
                        >
                            התחברות
                        </Button>
                    )}
                </Box>
            </Toolbar>
        </AppBar>
    );
}
