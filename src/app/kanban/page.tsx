"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/frontend/context/AuthContext';
import { useData } from '@/frontend/context/DataContext';
import { useRouter } from 'next/navigation';
import {
    Container,
    Typography,
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
    Alert
} from '@mui/material';
import KanbanBoard from '@/frontend/components/kanban/KanbanBoard';
import { Task, getProjectTasks, addTask, updateTaskStatus, deleteTask, updateTask } from '@/backend/firestore';

export default function KanbanPage() {
    const { user, loading } = useAuth();
    const { projects } = useData();
    const router = useRouter();

    const [selectedProjectId, setSelectedProjectId] = useState<string>('');
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoadingTasks, setIsLoadingTasks] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    // Load tasks when project changes
    useEffect(() => {
        const loadTasks = async () => {
            if (user && selectedProjectId) {
                setIsLoadingTasks(true);
                try {
                    const projectTasks = await getProjectTasks(user.uid, selectedProjectId);
                    setTasks(projectTasks);
                } catch (error) {
                    console.error("Failed to load tasks", error);
                } finally {
                    setIsLoadingTasks(false);
                }
            } else {
                setTasks([]);
            }
        };
        loadTasks();
    }, [user, selectedProjectId]);

    const handleTasksChange = (newTasks: Task[]) => {
        setTasks(newTasks);
    };

    const handleAddTask = async (
        status: 'todo' | 'in-progress' | 'done',
        name: string,
        description?: string,
        priority?: 'high' | 'medium' | 'low',
        dueDate?: number | null
    ) => {
        if (!user || !selectedProjectId) return;
        try {
            await addTask(user.uid, selectedProjectId, name, description, priority, dueDate, status);
            // Refresh tasks
            const updatedTasks = await getProjectTasks(user.uid, selectedProjectId);
            setTasks(updatedTasks);
        } catch (error) {
            console.error("Error adding task:", error);
        }
    };

    const handleEditTask = async (task: Task) => {
        if (!user || !selectedProjectId || !task.id) return;
        try {
            // Optimistic update
            setTasks(prev => prev.map(t => t.id === task.id ? task : t));

            await updateTask(user.uid, selectedProjectId, task.id, {
                name: task.name,
                description: task.description,
                priority: task.priority,
                dueDate: task.dueDate,
                status: task.status
            });
        } catch (error) {
            console.error("Error updating task:", error);
            // Revert on error? For now, we rely on refresh or ignoring.
        }
    };

    if (loading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <CircularProgress />
        </Box>
    );

    return (
        <Container maxWidth="xl" sx={{ py: 4, height: 'calc(100vh - 80px)' }}> {/* Full height minus header approx */}
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h4" fontWeight="bold">לוח משימות</Typography>

                <FormControl sx={{ minWidth: 250 }}>
                    <InputLabel>בחר פרויקט</InputLabel>
                    <Select
                        value={selectedProjectId}
                        label="בחר פרויקט"
                        onChange={(e) => setSelectedProjectId(e.target.value)}
                    >
                        {projects.map((p) => (
                            <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            {selectedProjectId ? (
                isLoadingTasks ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Box sx={{ height: 'calc(100% - 100px)' }}>
                        <KanbanBoard
                            tasks={tasks}
                            userId={user!.uid}
                            projectId={selectedProjectId}
                            onTasksChange={handleTasksChange}
                            onAddTask={handleAddTask}
                            onEditTask={handleEditTask}
                        />
                    </Box>
                )
            ) : (
                <Box sx={{ mt: 10, textAlign: 'center', opacity: 0.7 }}>
                    <Typography variant="h5" color="textSecondary">
                        👈 בחר פרויקט כדי לצפות בלוח המשימות
                    </Typography>
                </Box>
            )}
        </Container>
    );
}
