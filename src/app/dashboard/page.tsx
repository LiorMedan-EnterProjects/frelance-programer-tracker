"use client";

import { useState, useMemo, useEffect } from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import AddIcon from '@mui/icons-material/Add';

import { useAuth } from "@/frontend/context/AuthContext";
import { useRouter } from "next/navigation";
import { sendEmailVerification } from "firebase/auth";
import { useData } from "@/frontend/context/DataContext";

import DashboardStats from "@/frontend/components/dashboard/DashboardStats";
import TimeLogList from "@/frontend/components/timer/TimeLogList";
import TimerDialogTrigger from "@/frontend/components/timer/TimerDialogTrigger"; // Import new trigger
import ProjectList from "@/frontend/components/projects/ProjectList";
import HoursByProjectChart from "@/frontend/components/dashboard/HoursByProjectChart";
import WeeklyActivityChart from "@/frontend/components/dashboard/WeeklyActivityChart";
import StatusBarChart from "@/frontend/components/dashboard/StatusBarChart";
import ProjectModal from "@/frontend/components/projects/ProjectModal";
import { prepareTaskStatusData, prepareProjectStatusData } from "@/frontend/utils/chartUtils";

export default function DashboardPage() {
    const { user, loading } = useAuth();
    const { projects, logs, tasks, createNewProject, refreshData } = useData();
    const router = useRouter();

    // Modal State
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

    // Filter out logs that belong to deleted projects
    const activeLogs = useMemo(() => {
        return logs.filter(log => projects.some(p => p.id === log.projectId));
    }, [logs, projects]);

    const [verificationSent, setVerificationSent] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    const handleResendVerification = async () => {
        if (user) {
            try {
                await sendEmailVerification(user);
                setVerificationSent(true);
            } catch (error) {
                console.error("Error sending verification email", error);
            }
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!user) {
        return null; // Will redirect
    }

    const handleCreateProject = async (projectData: any) => {
        try {
            await createNewProject(projectData);
            setIsProjectModalOpen(false);
        } catch (error) {
            console.error("Error creating project:", error);
        }
    };

    return (
        <Container maxWidth="xl" sx={{ mb: 4 }}> {/* Increased bottom margin */}
            <Box sx={{ my: 4 }}>
                {/* Header & Alerts */}
                {!user.emailVerified && (
                    <Alert severity="warning" sx={{ mb: 2 }} action={/* ... */ null}>
                        {verificationSent ? "מייל נשלח" : "נא לאמת מייל"}
                    </Alert>
                )}

                {/* Dashboard Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h4" component="h1" fontWeight="bold">
                        לוח בקרה
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TimerDialogTrigger />
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => setIsProjectModalOpen(true)}
                        >
                            פרויקט חדש
                        </Button>
                    </Box>
                </Box>

                {/* 1. Stats Cards (Moved up as Timer is now in header) */}
                <Box sx={{ mb: 3 }}>
                    <DashboardStats projects={projects} logs={activeLogs} />
                </Box>

                {/* 2. Charts Area - Status & Completion */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Paper sx={{ p: 2, borderRadius: 3, height: '100%' }}>
                            <StatusBarChart
                                title="סטטוס משימות"
                                data={useMemo(() => prepareTaskStatusData(tasks), [tasks])}
                            />
                        </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Paper sx={{ p: 2, borderRadius: 3, height: '100%' }}>
                            <HoursByProjectChart
                                title="סטטוס פרויקטים"
                                data={useMemo(() => prepareProjectStatusData(projects), [projects])}
                            />
                        </Paper>
                    </Grid>
                </Grid>

                {/* 3. Bottom Area: Projects & Recent Activity */}
                <Grid container spacing={2} sx={{ height: { md: 400, xs: 'auto' } }}> {/* Fixed height on desktop */}
                    <Grid size={{ xs: 12, md: 6 }} sx={{ height: '100%' }}>
                        <Paper sx={{ p: 2, borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6" fontWeight="bold">הפרויקטים שלי</Typography>
                                <Box>
                                    <Button
                                        size="small"
                                        startIcon={<AddIcon />}
                                        onClick={() => setIsProjectModalOpen(true)}
                                        sx={{ mr: 1 }}
                                    >
                                        חדש
                                    </Button>
                                    <Button size="small" onClick={() => router.push('/projects')}>הכל</Button>
                                </Box>
                            </Box>
                            <Box sx={{ flexGrow: 1, overflowY: 'auto', pr: 1 }}>
                                <ProjectList
                                    projects={projects}
                                    logs={activeLogs}
                                    onDelete={(id) => console.log("Delete not impl")}
                                    onEdit={(p) => router.push(`/projects/${p.id}`)}
                                />
                            </Box>
                        </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }} sx={{ height: '100%' }}>
                        <Paper sx={{ p: 2, borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6" fontWeight="bold">פעילות אחרונה</Typography>
                                <Button size="small" onClick={() => router.push('/timer')}>הכל</Button>
                            </Box>
                            <Box sx={{ flexGrow: 1, overflowY: 'auto', pr: 1 }}>
                                <TimeLogList
                                    logs={activeLogs.slice(0, 20)}
                                    projects={projects}
                                    userId={user.uid}
                                    onLogUpdated={refreshData}
                                />
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>

                {/* Global Project Modal */}
                <ProjectModal
                    open={isProjectModalOpen}
                    onClose={() => setIsProjectModalOpen(false)}
                    onSave={handleCreateProject}
                />
            </Box>
        </Container>
    );
}
