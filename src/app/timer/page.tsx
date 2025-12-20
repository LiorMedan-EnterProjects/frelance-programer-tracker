"use client";

import { useEffect, useState, useMemo } from 'react';
import { Container, Typography, Box, Paper, Button } from '@mui/material';
import { useAuth } from '@/frontend/context/AuthContext';
import { useData } from '@/frontend/context/DataContext'; // Use global data
import TimerDialogTrigger from '@/frontend/components/timer/TimerDialogTrigger';
import TimeLogList from '@/frontend/components/timer/TimeLogList';
import { useRouter } from 'next/navigation';

export default function TimerPage() {
    const { user, loading } = useAuth();
    const { projects, logs, refreshData } = useData();
    const router = useRouter();

    // Filter active logs (if associated with existing projects)
    const activeLogs = useMemo(() => {
        return logs; // Show all logs in history page, even if project deleted? Or filter. Let's show all.
    }, [logs]);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading || !user) return null;

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" fontWeight="bold">
                    היסטוריית פעילות
                </Typography>
                <TimerDialogTrigger />
            </Box>

            <Paper sx={{ p: 3, borderRadius: 3 }}>
                <TimeLogList
                    logs={activeLogs}
                    projects={projects}
                    userId={user.uid}
                    onLogUpdated={refreshData}
                />
            </Paper>
        </Container>
    );
}
