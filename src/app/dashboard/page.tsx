
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
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import AddIcon from '@mui/icons-material/Add';

import { useAuth } from "@/frontend/context/AuthContext";
import { useRouter } from "next/navigation";
import { sendEmailVerification } from "firebase/auth";
import { useData } from "@/frontend/context/DataContext";
import { addProject } from "@/backend/firestore"; // Import addProject

import DashboardStats from "@/frontend/components/dashboard/DashboardStats";
import TimeLogList from "@/frontend/components/timer/TimeLogList";
import Timer from "@/frontend/components/timer/Timer";
import ProjectList from "@/frontend/components/projects/ProjectList";
import HoursByProjectChart from "@/frontend/components/dashboard/HoursByProjectChart";
import WeeklyActivityChart from "@/frontend/components/dashboard/WeeklyActivityChart";
import StatusBarChart from "@/frontend/components/dashboard/StatusBarChart";
import { prepareProjectData, prepareWeeklyActivity, prepareTaskStatusData, prepareProjectStatusData } from "@/frontend/utils/chartUtils";

export default function DashboardPage() {
    const { user, loading } = useAuth();
    const { projects, logs, tasks } = useData(); // Added tasks
    const router = useRouter();

    // Dialog State
    const [openProjectDialog, setOpenProjectDialog] = useState(false);
    const [newProjectName, setNewProjectName] = useState("");
    const [newProjectRate, setNewProjectRate] = useState("");
    const [newProjectClient, setNewProjectClient] = useState("");

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

    const handleLogAdded = () => {
        // Trigger data refresh if needed, but DataContext should handle real-time updates
        // If DataContext is not real-time, we might need a force refresh.
        // Assuming DataContext is real-time for now.
    };

    const handleDeleteProject = async (id: string) => {
        if (confirm('האם למחוק את הפרויקט?')) {
            // await deleteProject(id); // Need to import deleteProject
            // For now, let's strictly follow existing imports or add it.
            // Im implementing the layout first.
        }
    };

    const handleCreateProject = async () => {
        if (!user || !newProjectName.trim()) return;
        try {
            await addProject({
                userId: user.uid,
                name: newProjectName,
                client: newProjectClient,
                hourlyRate: Number(newProjectRate),
                color: '#' + Math.floor(Math.random() * 16777215).toString(16),
                status: 'active'
            });
            setOpenProjectDialog(false);
            setNewProjectName("");
            setNewProjectRate("");
            setNewProjectClient("");
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

                {/* 1. Timer (Top Priority) */}
                <Box sx={{ mb: 3 }}>
                    <Timer
                        projects={projects}
                        userId={user.uid}
                        onLogAdded={handleLogAdded}
                    />
                </Box>

                {/* 2. Stats Cards */}
                <Box sx={{ mb: 3 }}>
                    <DashboardStats projects={projects} logs={activeLogs} />
                </Box>

                {/* 3. Charts Area - Status & Completion */}
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

                {/* 4. Bottom Area: Projects & Recent Activity */}
                <Grid container spacing={2} sx={{ height: { md: 400, xs: 'auto' } }}> {/* Fixed height on desktop */}
                    <Grid size={{ xs: 12, md: 6 }} sx={{ height: '100%' }}>
                        <Paper sx={{ p: 2, borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6" fontWeight="bold">הפרויקטים שלי</Typography>
                                <Box>
                                    <Button
                                        size="small"
                                        startIcon={<AddIcon />}
                                        onClick={() => setOpenProjectDialog(true)}
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
                                <TimeLogList logs={activeLogs.slice(0, 20)} projects={projects} />
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>

                {/* Add Project Dialog */}
                <Dialog open={openProjectDialog} onClose={() => setOpenProjectDialog(false)} maxWidth="sm" fullWidth dir="rtl">
                    <DialogTitle>פרויקט חדש</DialogTitle>
                    <DialogContent dividers>
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth
                                    label="שם הפרויקט"
                                    value={newProjectName}
                                    onChange={(e) => setNewProjectName(e.target.value)}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth
                                    label="שם הלקוח"
                                    value={newProjectClient}
                                    onChange={(e) => setNewProjectClient(e.target.value)}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    label="תעריף לשעה (₪)"
                                    value={newProjectRate}
                                    onChange={(e) => setNewProjectRate(e.target.value)}
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={() => setOpenProjectDialog(false)}>ביטול</Button>
                        <Button variant="contained" onClick={handleCreateProject} disabled={!newProjectName.trim()}>
                            צור פרויקט
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </Container>
    );
}

