"use client";

import { useEffect, useState } from 'react';
import { Container, Typography, Box } from '@mui/material';
import { useAuth } from '@/context/AuthContext';
import { getProjects, getTimeLogs, Project, TimeLog } from '@/lib/firestore';
import Timer from '@/components/timer/Timer';

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
        <Container maxWidth="md" sx={{ py: 4 }}>


            <Box sx={{ mt: 4 }}>
                <Timer
                    projects={projects}
                    userId={user.uid}
                    onLogAdded={fetchData}
                />
            </Box>
        </Container>
    );
}
