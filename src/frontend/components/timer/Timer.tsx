"use client";

import { useState, useEffect, useRef } from 'react';
import {
    Box,
    Button,
    Typography,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    TextField,
    Paper,
    Stack,
    useTheme,
    alpha,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Tooltip,
    Divider
} from '@mui/material';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import StopRoundedIcon from '@mui/icons-material/StopRounded';
import EditCalendarRoundedIcon from '@mui/icons-material/EditCalendarRounded';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import { Project, addTimeLog, getProjectTasks, Task } from '@/backend/firestore';
import { Timestamp } from 'firebase/firestore';
import { keyframes } from '@emotion/react';
import ProjectModal from '../projects/ProjectModal';
import TimeLogModal from './TimeLogModal';
import { useData } from '../../context/DataContext';

// ... keyframes (pulse, pulseDark) ...
const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(37, 99, 235, 0); }
  100% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0); }
`;
const pulseDark = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(96, 165, 250, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(96, 165, 250, 0); }
  100% { box-shadow: 0 0 0 0 rgba(96, 165, 250, 0); }
`;


interface TimerProps {
    projects: Project[];
    userId: string;
    onLogAdded: () => void;
}

export default function Timer({ projects: propProjects, userId, onLogAdded }: TimerProps) {
    const theme = useTheme();
    const { createNewProject, projects: contextProjects } = useData(); // Use context for actions, props for data fallback
    // Prefer context projects if available to ensure sync after creation
    const projects = contextProjects.length > 0 ? contextProjects : propProjects;

    const [selectedProject, setSelectedProject] = useState('');
    const [tasks, setTasks] = useState<Task[]>([]);
    const [selectedTaskId, setSelectedTaskId] = useState('');
    const [description, setDescription] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [startTime, setStartTime] = useState<Date | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Manual Entry State
    const [openManualDialog, setOpenManualDialog] = useState(false);

    // Create Project State
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

    useEffect(() => {
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    // Fetch tasks when project changes
    useEffect(() => {
        const fetchTasks = async () => {
            if (selectedProject) {
                const projectTasks = await getProjectTasks(userId, selectedProject);
                setTasks(projectTasks);
                setSelectedTaskId('');
            } else {
                setTasks([]);
            }
        };
        fetchTasks();
    }, [selectedProject, userId]);

    const handleStart = () => {
        if (!selectedProject) {
            alert("נא לבחור פרויקט תחילה.");
            return;
        }
        setStartTime(new Date());
        setIsRunning(true);
        intervalRef.current = setInterval(() => {
            setElapsedTime(prev => prev + 1);
        }, 1000);
    };

    const handleStop = async () => {
        if (!intervalRef.current || !startTime) return;
        clearInterval(intervalRef.current);
        setIsRunning(false);

        const endTime = new Date();
        const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

        try {
            const task = tasks.find(t => t.id === selectedTaskId);
            await addTimeLog({
                userId,
                projectId: selectedProject,
                taskId: selectedTaskId || undefined,
                taskName: task ? task.name : undefined,
                startTime: Timestamp.fromDate(startTime),
                endTime: Timestamp.fromDate(endTime),
                duration,
                description
            });
            onLogAdded();
            setElapsedTime(0);
            setStartTime(null);
            setDescription('');
        } catch (error) {
            console.error("Error saving time log:", error);
        }
    };

    const handleManualSubmit = async (logData: any) => {
        try {
            await addTimeLog({
                ...logData,
                userId
            });
            onLogAdded();
            setOpenManualDialog(false);
            alert("הדיווח נוסף בהצלחה!");
        } catch (error) {
            console.error("Error saving manual log:", error);
        }
    };

    const handleProjectChange = (e: any) => {
        const value = e.target.value;
        if (value === '__NEW_PROJECT__') {
            setIsProjectModalOpen(true);
        } else {
            setSelectedProject(value);
        }
    };

    const handleCreateProject = async (projectData: any) => {
        try {
            await createNewProject(projectData);
            setIsProjectModalOpen(false);
            // Optionally select the new project if we could get its ID,
            // but createNewProject might handle state updates async.
            // For now, user will see it in the list and can select it.
            // If createNewProject returns the ID, we could select it.
        } catch (error) {
            console.error("Error creating project:", error);
        }
    };

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <Paper
            elevation={3}
            sx={{
                p: 2,
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                flexWrap: 'wrap', // Allow wrapping on very small screens
                position: 'relative', // For manual button positioning
            }}
        >
            {/* Timer Display - Compact */}
            <Box sx={{
                minWidth: 120,
                textAlign: 'center',
                fontFamily: 'monospace',
                fontWeight: 'bold',
                fontSize: '2rem',
                lineHeight: 1,
                color: isRunning ? 'primary.main' : 'text.primary'
            }}>
                {formatTime(elapsedTime)}
            </Box>

            {/* Controls */}
            <Stack direction="row" spacing={1} flexGrow={1} alignItems="center">
                <FormControl size="small" sx={{ minWidth: 150, maxWidth: 200 }}>
                    <InputLabel>פרויקט</InputLabel>
                    <Select
                        value={selectedProject}
                        label="פרויקט"
                        onChange={handleProjectChange}
                        disabled={isRunning}
                    >
                        {projects.map((p) => (
                            <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                        ))}
                        <Divider />
                        <MenuItem value="__NEW_PROJECT__" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                            <AddIcon fontSize="small" sx={{ mr: 1 }} />
                            פרויקט חדש
                        </MenuItem>
                    </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 150, maxWidth: 200 }}>
                    <InputLabel>משימה</InputLabel>
                    <Select
                        value={selectedTaskId}
                        label="משימה"
                        onChange={(e) => setSelectedTaskId(e.target.value)}
                        disabled={isRunning || !selectedProject}
                    >
                        <MenuItem value=""><em>ללא משימה</em></MenuItem>
                        {tasks.map((t) => (
                            <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <TextField
                    size="small"
                    placeholder="תיאור..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    sx={{ flexGrow: 1 }}
                />
            </Stack>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 1 }}>
                {!isRunning ? (
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<PlayArrowRoundedIcon />}
                        onClick={handleStart}
                        disabled={!selectedProject}
                        sx={{ borderRadius: 2, px: 3 }}
                    >
                        התחל
                    </Button>
                ) : (
                    <Button
                        variant="contained"
                        color="error"
                        startIcon={<StopRoundedIcon />}
                        onClick={handleStop}
                        sx={{
                            borderRadius: 2,
                            px: 3,
                            animation: `${pulse} 2s infinite`
                        }}
                    >
                        עצור
                    </Button>
                )}

                <Tooltip title="הזנה ידנית">
                    <IconButton onClick={() => setOpenManualDialog(true)} size="small" sx={{ bgcolor: alpha(theme.palette.divider, 0.1) }}>
                        <EditCalendarRoundedIcon />
                    </IconButton>
                </Tooltip>
            </Box>

            {/* Manual Entry Dialog */}
            <TimeLogModal
                open={openManualDialog}
                onClose={() => setOpenManualDialog(false)}
                onSave={handleManualSubmit}
                projects={projects}
                userId={userId}
            />

            {/* Quick Create Project Modal */}
            <ProjectModal
                open={isProjectModalOpen}
                onClose={() => setIsProjectModalOpen(false)}
                onSave={handleCreateProject}
            />
        </Paper>
    );
}
