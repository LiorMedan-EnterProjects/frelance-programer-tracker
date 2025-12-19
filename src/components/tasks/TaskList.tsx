"use client";

import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
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
} from '@/lib/firestore'; // Check relative path if moved
import { useAuth } from '@/context/AuthContext';

interface TaskListProps {
    tasks: Task[];
    projectId: string; // Still needed for internal subtask logic if not hoisted? 
    // Ideally hoist everything. But Subtasks logic is complex.
    // Let's keep subtask logic here or hoist?
    // User wants "Continue development" -> Kanban features.
    // Let's hoist Add/Delete/Status update of TASKS. Subtasks can remain internal or be refetched.
    onAddTask: (name: string) => Promise<void>;
    onDeleteTask: (taskId: string) => Promise<void>;
    onUpdateTask: (task: Task) => void;
    onRefresh: () => void;
}

export default function TaskList({ tasks, projectId, onAddTask, onDeleteTask, onUpdateTask, onRefresh }: TaskListProps) {
    const { user } = useAuth();
    const theme = useTheme();

    // const [tasks, setTasks] = useState<Task[]>([]); // Removed local state
    const [newTaskName, setNewTaskName] = useState('');
    const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
    const [newSubTaskName, setNewSubTaskName] = useState('');
    const [activeSubTaskInput, setActiveSubTaskInput] = useState<string | null>(null);

    // Removed useEffect fetching


    const handleAddTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskName.trim()) return;

        try {
            await onAddTask(newTaskName);
            setNewTaskName('');
            onRefresh();
        } catch (error) {
            console.error("Error adding task:", error);
        }
    };

    const handleDeleteTask = async (taskId: string) => {
        if (!confirm('האם למחוק את המשימה?')) return;
        try {
            await onDeleteTask(taskId);
            onRefresh();
        } catch (error) {
            console.error("Error deleting task:", error);
        }
    };

    const handleAddSubTask = async (taskId: string) => {
        if (!newSubTaskName.trim() || !user || !projectId) return;

        try {
            await addSubTask(user.uid, projectId, taskId, newSubTaskName);
            setNewSubTaskName('');
            setActiveSubTaskInput(null);
            onRefresh();
        } catch (error) {
            console.error("Error adding sub-task:", error);
        }
    };

    const handleDeleteSubTask = async (task: Task, subTaskId: string) => {
        if (!user || !projectId) return;
        try {
            const updatedSubTasks = task.subTasks.filter(st => st.id !== subTaskId);
            await updateSubTask(user.uid, projectId, task.id!, updatedSubTasks);
            onRefresh();
        } catch (error) {
            console.error("Error deleting sub-task:", error);
        }
    };

    const toggleTaskStatus = async (task: Task) => {
        if (!user || !projectId || !task.id) return;
        // This logic is old! status is now todo/in-progress/done.
        // We need to map boolean toggle to new status?
        // If 'done' -> 'todo'?
        // If 'todo'/'in-progress' -> 'done'?
        const nextStatus = task.status === 'done' ? 'todo' : 'done';

        try {
            await updateTaskStatus(user.uid, projectId, task.id, nextStatus);
            onUpdateTask({ ...task, status: nextStatus });
        } catch (error) {
            console.error("Error updating task status:", error);
        }
    };

    return (
        <Stack spacing={3}>
            {/* Add New Task Form */}
            <Paper sx={{ p: 2, borderRadius: 3 }} dir="rtl">
                <Stack direction="row" spacing={2} component="form" onSubmit={handleAddTask}>
                    <TextField
                        fullWidth
                        placeholder="שם משימה חדשה..."
                        value={newTaskName}
                        onChange={(e) => setNewTaskName(e.target.value)}
                        size="small"
                        sx={{
                            '& .MuiOutlinedInput-root': { borderRadius: 2 },
                            '& input': { textAlign: 'right' }
                        }}
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
                                    opacity: task.status === 'completed' ? 0.6 : 1,
                                    flexWrap: 'wrap',
                                    direction: 'rtl' // Ensure RTL
                                }}
                            >
                                <ListItemText
                                    primary={
                                        <Stack direction="row" alignItems="center" spacing={1}>
                                            <Checkbox
                                                edge="start"
                                                checked={task.status === 'completed'}
                                                onChange={() => toggleTaskStatus(task)}
                                            />
                                            <Typography
                                                variant="h6"
                                                sx={{
                                                    textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                                                    fontSize: '1.1rem',
                                                    textAlign: 'right' // Force Right Align
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
                                    sx={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }} // Align text right
                                />
                                <ListItemSecondaryAction sx={{ left: 16, right: 'auto' }}> {/* Move actions to left in RTL */}
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
                                                    sx={{ textAlign: 'right', pr: 2 }} // Added padding right
                                                    secondaryTypographyProps={{ component: 'div' }}
                                                />
                                                <ListItemSecondaryAction sx={{ left: 16, right: 'auto' }}>
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
                                                        sx={{ input: { textAlign: 'right' } }}
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
                                                    sx={{ mr: 'auto', ml: 0 }} // Align button to right or left? In RTL, mr: auto pushes to left. 
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
    );
}
