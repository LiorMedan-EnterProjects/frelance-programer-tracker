"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/frontend/context/AuthContext';
import { useData } from '@/frontend/context/DataContext';
import { useRouter } from 'next/navigation';
import {
    Container,
    Typography,
    // ... (skip intermediate lines if possible, but replace requires contiguous block usually, or multi_replace. Here I'll use exact replace for imports)
    // Wait, I can't skip lines in replace_file_content easily without providing all context.
    // I'll grab the top block.
    Box,
    Paper,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Button,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Collapse,
    Checkbox,
    Chip,
    Stack,
    Divider,
    useTheme,
    alpha
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import AddIcon from '@mui/icons-material/Add';
import {
    getProjectTasks,
    addTask,
    addSubTask,
    updateTaskStatus,
    deleteTask,
    Task,
    SubTask,
    updateSubTask
} from '@/backend/firestore';

export default function TasksPage() {
    const { user, loading } = useAuth();
    const { projects } = useData();
    const router = useRouter();
    const theme = useTheme();

    const [selectedProjectId, setSelectedProjectId] = useState<string>('');
    const [tasks, setTasks] = useState<Task[]>([]);
    const [newTaskName, setNewTaskName] = useState('');
    const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
    const [newSubTaskName, setNewSubTaskName] = useState('');
    const [activeSubTaskInput, setActiveSubTaskInput] = useState<string | null>(null);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    // Load tasks when project changes
    useEffect(() => {
        const loadTasks = async () => {
            if (user && selectedProjectId) {
                const projectTasks = await getProjectTasks(user.uid, selectedProjectId);
                setTasks(projectTasks);
            } else {
                setTasks([]);
            }
        };
        loadTasks();
    }, [user, selectedProjectId]);

    const handleAddTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskName.trim() || !user || !selectedProjectId) return;

        try {
            await addTask(user.uid, selectedProjectId, newTaskName);
            setNewTaskName('');
            // Reload tasks
            const updatedTasks = await getProjectTasks(user.uid, selectedProjectId);
            setTasks(updatedTasks);
        } catch (error) {
            console.error("Error adding task:", error);
        }
    };

    const handleDeleteTask = async (taskId: string) => {
        if (!user || !selectedProjectId || !confirm('האם למחוק את המשימה?')) return;
        try {
            await deleteTask(user.uid, selectedProjectId, taskId);
            setTasks(tasks.filter(t => t.id !== taskId));
        } catch (error) {
            console.error("Error deleting task:", error);
        }
    };

    const handleAddSubTask = async (taskId: string) => {
        if (!newSubTaskName.trim() || !user || !selectedProjectId) return;

        try {
            await addSubTask(user.uid, selectedProjectId, taskId, newSubTaskName);
            setNewSubTaskName('');
            setActiveSubTaskInput(null);
            // Reload tasks to get the new subtask with ID
            const updatedTasks = await getProjectTasks(user.uid, selectedProjectId);
            setTasks(updatedTasks);
        } catch (error) {
            console.error("Error adding sub-task:", error);
        }
    };

    const handleDeleteSubTask = async (task: Task, subTaskId: string) => {
        if (!user || !selectedProjectId) return;
        try {
            const updatedSubTasks = task.subTasks.filter(st => st.id !== subTaskId);
            await updateSubTask(user.uid, selectedProjectId, task.id!, updatedSubTasks);
            // Verify visually immediately
            setTasks(tasks.map(t => t.id === task.id ? { ...t, subTasks: updatedSubTasks } : t));
        } catch (error) {
            console.error("Error deleting sub-task:", error);
        }
    };

    const toggleTaskStatus = async (task: Task) => {
        if (!user || !selectedProjectId || !task.id) return;
        const newStatus = task.status === 'done' ? 'todo' : 'done';
        try {
            await updateTaskStatus(user.uid, selectedProjectId, task.id, newStatus);
            setTasks(tasks.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
        } catch (error) {
            console.error("Error updating task status:", error);
        }
    };

    if (loading) return <Typography>Loading...</Typography>;

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            {/* Header / Project Select */}
            <Box sx={{ mb: 4 }}>
                <FormControl fullWidth>
                    <InputLabel>בחר פרויקט לניהול משימות</InputLabel>
                    <Select
                        value={selectedProjectId}
                        label="בחר פרויקט לניהול משימות"
                        onChange={(e) => setSelectedProjectId(e.target.value)}
                        sx={{ borderRadius: 2 }}
                    >
                        {projects.map((p) => (
                            <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            {selectedProjectId && (
                <Stack spacing={3}>
                    {/* Add New Task Form */}
                    <Paper sx={{ p: 2, borderRadius: 3 }}>
                        <Stack direction="row" spacing={2} component="form" onSubmit={handleAddTask}>
                            <TextField
                                fullWidth
                                placeholder="שם משימה חדשה..."
                                value={newTaskName}
                                onChange={(e) => setNewTaskName(e.target.value)}
                                size="small"
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            />
                            <Button
                                type="submit"
                                variant="contained"
                                startIcon={<AddIcon />}
                                disabled={!newTaskName.trim()}
                                sx={{ borderRadius: 2, px: 3 }}
                            >
                                הוסף
                            </Button>
                        </Stack>
                    </Paper>

                    {/* Task List */}
                    <List sx={{ width: '100%', bgcolor: 'background.paper', borderRadius: 3, overflow: 'hidden' }}>
                        {tasks.length === 0 ? (
                            <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
                                אין משימות בפרויקט זה. התחל להוסיף!
                            </Box>
                        ) : (
                            tasks.map((task) => (
                                <Box key={task.id} sx={{ '&:not(:last-child)': { borderBottom: `1px solid ${theme.palette.divider}` } }}>
                                    <ListItem
                                        sx={{
                                            opacity: task.status === 'done' ? 0.6 : 1,
                                            flexWrap: 'wrap'
                                        }}
                                    >
                                        <ListItemText
                                            primary={
                                                <Stack direction="row" alignItems="center" spacing={1}>
                                                    <Checkbox
                                                        edge="start"
                                                        checked={task.status === 'done'}
                                                        onChange={() => toggleTaskStatus(task)}
                                                    />
                                                    <Typography
                                                        variant="h6"
                                                        sx={{
                                                            textDecoration: task.status === 'done' ? 'line-through' : 'none',
                                                            fontSize: '1.1rem'
                                                        }}
                                                    >
                                                        {task.name}
                                                    </Typography>
                                                    <Chip
                                                        label={`${task.subTasks?.length || 0} תתי-משימות`}
                                                        size="small"
                                                        variant="outlined"
                                                        sx={{ fontSize: '0.75rem', height: 24 }}
                                                    />
                                                </Stack>
                                            }
                                        />
                                        <ListItemSecondaryAction>
                                            <IconButton onClick={() => setExpandedTaskId(expandedTaskId === task.id ? null : task.id as string)}>
                                                {expandedTaskId === task.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                            </IconButton>
                                            <IconButton onClick={() => task.id && handleDeleteTask(task.id)} edge="end" color="error">
                                                <DeleteIcon />
                                            </IconButton>
                                        </ListItemSecondaryAction>
                                    </ListItem>

                                    {/* Sub-tasks Collapse */}
                                    <Collapse in={expandedTaskId === task.id} timeout="auto" unmountOnExit>
                                        <Box sx={{ pl: 4, pr: 8, pb: 2, bgcolor: alpha(theme.palette.primary.main, 0.03) }}>
                                            <List disablePadding>
                                                {task.subTasks?.map((subTask) => (
                                                    <ListItem key={subTask.id} dense>
                                                        <ListItemText
                                                            primary={subTask.name}
                                                            sx={{ textAlign: 'right' }}
                                                            secondaryTypographyProps={{ component: 'div' }} // Fix hydration
                                                        />
                                                        <ListItemSecondaryAction>
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => task.id && handleDeleteSubTask(task, subTask.id)}
                                                            >
                                                                <DeleteIcon fontSize="small" />
                                                            </IconButton>
                                                        </ListItemSecondaryAction>
                                                    </ListItem>
                                                ))}

                                                {/* Add Subtask Input */}
                                                <ListItem>
                                                    {activeSubTaskInput === task.id ? (
                                                        <Stack direction="row" spacing={1} width="100%">
                                                            <TextField
                                                                fullWidth
                                                                size="small"
                                                                placeholder="שם תת-משימה..."
                                                                value={newSubTaskName}
                                                                onChange={(e) => setNewSubTaskName(e.target.value)}
                                                                autoFocus
                                                            />
                                                            <Button
                                                                variant="contained"
                                                                size="small"
                                                                onClick={() => task.id && handleAddSubTask(task.id)}
                                                            >
                                                                שמור
                                                            </Button>
                                                            <Button
                                                                variant="text"
                                                                size="small"
                                                                onClick={() => setActiveSubTaskInput(null)}
                                                            >
                                                                ביטול
                                                            </Button>
                                                        </Stack>
                                                    ) : (
                                                        <Button
                                                            startIcon={<AddIcon />}
                                                            size="small"
                                                            onClick={() => {
                                                                setActiveSubTaskInput(task.id as string);
                                                                setNewSubTaskName('');
                                                            }}
                                                        >
                                                            הוסף תת-משימה
                                                        </Button>
                                                    )}
                                                </ListItem>
                                            </List>
                                        </Box>
                                    </Collapse>
                                </Box>
                            ))
                        )}
                    </List>
                </Stack>
            )}

            {!selectedProjectId && !loading && (
                <Box sx={{ mt: 10, textAlign: 'center', opacity: 0.7 }}>
                    <Typography variant="h5" color="textSecondary">
                        👈 בחר פרויקט כדי להתחיל לנהל משימות
                    </Typography>
                </Box>
            )}
        </Container>
    );
}
