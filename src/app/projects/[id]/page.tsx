"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { useRouter, useParams } from 'next/navigation';
import {
    Container,
    Typography,
    Box,
    Paper,
    Stack,
    Grid,
    CircularProgress,
    Button,
    ToggleButton,
    ToggleButtonGroup
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';

import TaskList from '@/components/tasks/TaskList';
import KanbanBoard from '@/components/kanban/KanbanBoard';
import { getProjectTasks, Task, addTask, deleteTask } from '@/lib/firestore';

export default function ProjectDetailsPage() {
    const { user, loading } = useAuth();
    const { projects, logs } = useData();
    const router = useRouter();
    const params = useParams();
    const projectId = params.id as string;

    const [project, setProject] = useState<any>(null);
    const [viewMode, setViewMode] = useState<'list' | 'board'>('board'); // Default to board
    const [tasks, setTasks] = useState<Task[]>([]);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
            return;
        }
        if (projects.length > 0 && projectId) {
            const found = projects.find(p => p.id === projectId);
            if (found) {
                setProject(found);
            }
        }
    }, [user, loading, projects, projectId, router]);

    // Load tasks separately to manage them here for both views
    useEffect(() => {
        const loadTasks = async () => {
            if (user && projectId) {
                const projectTasks = await getProjectTasks(user.uid, projectId);
                setTasks(projectTasks);
            }
        };
        loadTasks();
    }, [user, projectId]);


    if (loading || !project) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
                <CircularProgress />
            </Box>
        );
    }

    // Calculate Project Stats
    const projectLogs = logs.filter(l => l.projectId === projectId);
    const totalHours = projectLogs.reduce((acc, log) => acc + (log.duration / 3600), 0);
    const totalEarnings = totalHours * (project.hourlyRate || 0);

    return (
        <Container maxWidth="xl" sx={{ py: 4 }} dir="rtl"> {/* maxWidth xl for board */}
            <Button
                startIcon={<ArrowBackIcon sx={{ transform: 'rotate(180deg)' }} />}
                onClick={() => router.push('/projects')}
                sx={{ mb: 2, alignSelf: 'flex-start' }}
            >
                חזרה לרשימת הפרויקטים
            </Button>

            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        bgcolor: project.color,
                        flexShrink: 0
                    }} />
                    <Typography variant="h4" component="h1" fontWeight="bold">
                        {project.name}
                    </Typography>
                </Box>

                {/* Stats Summary - Compact */}
                <Stack direction="row" spacing={3} sx={{ display: { xs: 'none', md: 'flex' } }}>
                    <Box textAlign="right">
                        <Typography variant="caption" color="text.secondary">שעות</Typography>
                        <Typography variant="h6" fontWeight="bold">{totalHours.toFixed(1)}</Typography>
                    </Box>
                    <Box textAlign="right">
                        <Typography variant="caption" color="text.secondary">רווח</Typography>
                        <Typography variant="h6" fontWeight="bold" color="success.main">₪{totalEarnings.toFixed(0)}</Typography>
                    </Box>
                </Stack>
            </Box>

            {/* View Toggle & Title */}
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" fontWeight="bold">ניהול משימות</Typography>

                <ToggleButtonGroup
                    value={viewMode}
                    exclusive
                    onChange={(e, newView) => newView && setViewMode(newView)}
                    size="small"
                    dir="ltr"
                >
                    <ToggleButton value="list" aria-label="list view">
                        <ViewListIcon />
                    </ToggleButton>
                    <ToggleButton value="board" aria-label="kanban board">
                        <ViewKanbanIcon />
                    </ToggleButton>
                </ToggleButtonGroup>
            </Box>

            {viewMode === 'list' ? (
                <TaskList
                    tasks={tasks}
                    projectId={projectId}
                    onAddTask={async (name) => {
                        if (!user || !projectId) return;
                        await addTask(user.uid, projectId, name);
                        // Refresh handled by onRefresh prop call in TaskList or here?
                        // TaskList calls logic then onRefresh.
                    }}
                    onDeleteTask={async (taskId) => {
                        if (!user || !projectId) return;
                        await deleteTask(user.uid, projectId, taskId);
                    }}
                    onUpdateTask={(updatedTask) => {
                        setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
                    }}
                    onRefresh={async () => {
                        if (user && projectId) {
                            const updated = await getProjectTasks(user.uid, projectId);
                            setTasks(updated);
                        }
                    }}
                />
            ) : (
                <KanbanBoard
                    tasks={tasks}
                    userId={user!.uid}
                    projectId={projectId}
                    onTasksChange={setTasks}
                    onEditTask={(updatedTask) => {
                        setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
                    }}
                    onDeleteTask={async (taskId) => {
                        if (!user || !projectId) return;
                        if (confirm('האם למחוק את המשימה?')) {
                            await deleteTask(user.uid, projectId, taskId);
                            const updated = await getProjectTasks(user.uid, projectId);
                            setTasks(updated);
                        }
                    }}
                />
            )}
        </Container>
    );
}
