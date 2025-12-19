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
    Tooltip
} from '@mui/material';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import StopRoundedIcon from '@mui/icons-material/StopRounded';
import EditCalendarRoundedIcon from '@mui/icons-material/EditCalendarRounded';
import CloseIcon from '@mui/icons-material/Close';
import { Project, addTimeLog, getProjectTasks, Task } from '@/backend/firestore';
import { Timestamp } from 'firebase/firestore';
import { keyframes } from '@emotion/react';

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

export default function Timer({ projects, userId, onLogAdded }: TimerProps) {
    const theme = useTheme();
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
    const [manualDate, setManualDate] = useState(new Date().toISOString().split('T')[0]);
    const [manualStartTime, setManualStartTime] = useState('09:00');
    const [manualEndTime, setManualEndTime] = useState('10:00');

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

    const handleManualSubmit = async () => {
        if (!selectedProject) return; // Should be handled by validation in form
        const start = new Date(`${manualDate}T${manualStartTime}`);
        const end = new Date(`${manualDate}T${manualEndTime}`);
        const duration = Math.floor((end.getTime() - start.getTime()) / 1000);

        if (duration <= 0) {
            alert("שעת הסיום חייבת להיות אחרי שעת ההתחלה.");
            return;
        }

        try {
            const task = tasks.find(t => t.id === selectedTaskId);
            await addTimeLog({
                userId,
                projectId: selectedProject,
                taskId: selectedTaskId || undefined,
                taskName: task ? task.name : undefined,
                startTime: Timestamp.fromDate(start),
                endTime: Timestamp.fromDate(end),
                duration,
                description
            });
            onLogAdded();
            setDescription('');
            setOpenManualDialog(false);
            alert("הדיווח נוסף בהצלחה!");
        } catch (error) {
            console.error("Error saving manual log:", error);
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
                        onChange={(e) => setSelectedProject(e.target.value)}
                        disabled={isRunning}
                    >
                        {projects.map((p) => (
                            <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                        ))}
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
            <Dialog open={openManualDialog} onClose={() => setOpenManualDialog(false)} maxWidth="xs" fullWidth dir="rtl">
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    הוספת זמן ידנית
                    <IconButton onClick={() => setOpenManualDialog(false)} size="small"><CloseIcon /></IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={3} sx={{ mt: 1 }}>
                        <FormControl fullWidth size="small">
                            <InputLabel>פרויקט</InputLabel>
                            <Select
                                value={selectedProject}
                                label="פרויקט"
                                onChange={(e) => setSelectedProject(e.target.value)}
                            >
                                {projects.map((p) => (
                                    <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth size="small">
                            <InputLabel>משימה</InputLabel>
                            <Select
                                value={selectedTaskId}
                                label="משימה"
                                onChange={(e) => setSelectedTaskId(e.target.value)}
                                disabled={!selectedProject}
                            >
                                <MenuItem value=""><em>ללא</em></MenuItem>
                                {tasks.map((t) => (
                                    <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <TextField
                            label="תיאור"
                            size="small"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            fullWidth
                        />
                        <TextField
                            type="date"
                            label="תאריך"
                            size="small"
                            value={manualDate}
                            onChange={(e) => setManualDate(e.target.value)}
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                        />
                        <Stack direction="row" spacing={2}>
                            <TextField
                                type="time"
                                label="התחלה"
                                size="small"
                                value={manualStartTime}
                                onChange={(e) => setManualStartTime(e.target.value)}
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                            />
                            <TextField
                                type="time"
                                label="סיום"
                                size="small"
                                value={manualEndTime}
                                onChange={(e) => setManualEndTime(e.target.value)}
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                            />
                        </Stack>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setOpenManualDialog(false)}>ביטול</Button>
                    <Button variant="contained" onClick={handleManualSubmit} disabled={!selectedProject}>
                        שמור
                    </Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
}
