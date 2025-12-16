"use client";

import { useEffect, useState } from 'react';
import { Container, Typography, Box, Grid } from '@mui/material';
import { useAuth } from '@/context/AuthContext';
import { getProjects, getTimeLogs, Project, TimeLog } from '@/lib/firestore';
import Timer from '@/components/timer/Timer';
import TimeLogList from '@/components/timer/TimeLogList';
import { useRouter } from 'next/navigation';

export default function TimerPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [projects, setProjects] = useState<Project[]>([]);
    const [logs, setLogs] = useState<TimeLog[]>([]);

    const fetchData = async () => {
        if (!user) return;
        try {
            const [projectsData, logsData] = await Promise.all([
                getProjects(user.uid),
                getTimeLogs(user.uid)
            ]);
            setProjects(projectsData);
            setLogs(logsData);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    useEffect(() => {
        if (!user) {
            router.push('/');
            return;
        }
        fetchData();
    }, [user, router]);

    if (!user) return null;

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Time Tracking
            </Typography>

            <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>Timer</Typography>
                    <Timer
                        projects={projects}
                        userId={user.uid}
                        onLogAdded={fetchData}
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>Recent Activity</Typography>
                    <TimeLogList logs={logs} projects={projects} />
                </Grid>
            </Grid>
        </Container>
    );
}
