"use client";

import Box from '@mui/material/Box';
import Navbar from '@/components/Navbar';
import { ReactNode } from 'react';

export default function AppShell({ children }: { children: ReactNode }) {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', direction: 'rtl' }}>
            <Navbar />

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: '100%',
                    maxWidth: 'xl', // Use maxWidth constraint for large screens
                    mx: 'auto', // Center content
                    transition: 'all 0.3s ease',
                }}
            >
                {children}
            </Box>
        </Box>
    );
}
