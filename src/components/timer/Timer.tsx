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
    Tabs,
    Tab,
    useTheme,
    alpha
} from '@mui/material';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import StopRoundedIcon from '@mui/icons-material/StopRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import EditCalendarRoundedIcon from '@mui/icons-material/EditCalendarRounded';
import { Project, addTimeLog } from '@/lib/firestore';
import { Timestamp } from 'firebase/firestore';
import { keyframes } from '@emotion/react';

const pulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.4);
  }
  70% {
    box-shadow: 0 0 0 15px rgba(37, 99, 235, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(37, 99, 235, 0);
  }
`;

const pulseDark = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(96, 165, 250, 0.4);
  }
  70% {
    box-shadow: 0 0 0 15px rgba(96, 165, 250, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(96, 165, 250, 0);
  }
`;

interface TimerProps {
    projects: Project[];
    userId: string;
    onLogAdded: () => void;
}

export default function Timer({ projects, userId, onLogAdded }: TimerProps) {
    const theme = useTheme();
    const [selectedProject, setSelectedProject] = useState('');
    const [description, setDescription] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [startTime, setStartTime] = useState<Date | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const [tabValue, setTabValue] = useState(0);

    // Manual Entry State
    const [manualDate, setManualDate] = useState(new Date().toISOString().split('T')[0]);
    const [manualStartTime, setManualStartTime] = useState('09:00');
    const [manualEndTime, setManualEndTime] = useState('10:00');

    useEffect(() => {
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

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
            await addTimeLog({
                userId,
                projectId: selectedProject,
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

    const handleManualSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProject) {
            alert("נא לבחור פרויקט.");
            return;
        }

        const start = new Date(`${manualDate}T${manualStartTime}`);
        const end = new Date(`${manualDate}T${manualEndTime}`);
        const duration = Math.floor((end.getTime() - start.getTime()) / 1000);

        if (duration <= 0) {
            alert("שעת הסיום חייבת להיות אחרי שעת ההתחלה.");
            return;
        }

        try {
            await addTimeLog({
                userId,
                projectId: selectedProject,
                startTime: Timestamp.fromDate(start),
                endTime: Timestamp.fromDate(end),
                duration,
                description
            });
            onLogAdded();
            setDescription('');
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
            elevation={0}
            sx={{
                p: 0,
                borderRadius: 4,
                overflow: 'hidden',
                border: `1px solid ${theme.palette.mode === 'dark' ? theme.palette.divider : alpha(theme.palette.divider, 0.1)}`,
                background: theme.palette.background.paper, // Solid background
                boxShadow: theme.shadows[4]
            }}
        >
            <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                <Tabs
                    value={tabValue}
                    onChange={(e, v) => setTabValue(v)}
                    centered
                    sx={{
                        '& .MuiTab-root': { fontWeight: 600, minHeight: 64, fontSize: '1rem' }
                    }}
                >
                    <Tab icon={<AccessTimeRoundedIcon />} iconPosition="start" label="שעון" />
                    <Tab icon={<EditCalendarRoundedIcon />} iconPosition="start" label="הזנה ידנית" />
                </Tabs>
            </Box>

            <Box sx={{ p: 4 }}>
                <Stack spacing={3}>
                    <FormControl fullWidth>
                        <InputLabel>פרויקט</InputLabel>
                        <Select
                            value={selectedProject}
                            label="פרויקט"
                            onChange={(e) => setSelectedProject(e.target.value)}
                            disabled={isRunning}
                            sx={{ borderRadius: 2, textAlign: 'center' }}
                            MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }}
                        >
                            {projects.map((p) => (
                                <MenuItem key={p.id} value={p.id} sx={{ justifyContent: 'center' }}>{p.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <TextField
                        label="תיאור"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        fullWidth
                        multiline
                        rows={2}
                        sx={{
                            '& .MuiOutlinedInput-root': { borderRadius: 2 }
                        }}
                        inputProps={{
                            style: { textAlign: 'center' }
                        }}
                    />

                    {tabValue === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 2 }}>
                            <Box
                                sx={{
                                    fontFamily: 'monospace',
                                    fontWeight: 700,
                                    fontSize: '5rem',
                                    mb: 4,
                                    letterSpacing: -2,
                                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    textShadow: isRunning ? `0px 10px 20px ${alpha(theme.palette.primary.main, 0.2)}` : 'none',
                                    transition: 'all 0.3s ease',
                                    direction: 'ltr' // Force LTR for timer digits
                                }}
                            >
                                {formatTime(elapsedTime)}
                            </Box>

                            {!isRunning ? (
                                <Button
                                    variant="contained"
                                    color="primary"
                                    size="large"
                                    startIcon={<PlayArrowRoundedIcon sx={{ fontSize: 32 }} />}
                                    onClick={handleStart}
                                    disabled={!selectedProject}
                                    sx={{
                                        px: 6,
                                        py: 2,
                                        fontSize: '1.2rem',
                                        borderRadius: 50,
                                        boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.4)}`,
                                        '&:hover': {
                                            transform: 'translateY(-2px)',
                                            boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.5)}`,
                                        },
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    התחל פוקוס
                                </Button>
                            ) : (
                                <Button
                                    variant="contained"
                                    color="error"
                                    size="large"
                                    startIcon={<StopRoundedIcon sx={{ fontSize: 32 }} />}
                                    onClick={handleStop}
                                    sx={{
                                        px: 6,
                                        py: 2,
                                        fontSize: '1.2rem',
                                        borderRadius: 50,
                                        animation: `${theme.palette.mode === 'dark' ? pulseDark : pulse} 2s infinite`,
                                        boxShadow: `0 8px 24px ${alpha(theme.palette.error.main, 0.4)}`,
                                        '&:hover': {
                                            transform: 'translateY(-2px)',
                                            boxShadow: `0 12px 32px ${alpha(theme.palette.error.main, 0.5)}`,
                                        },
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    סיים סשן
                                </Button>
                            )}
                        </Box>
                    ) : (
                        <Box component="form" onSubmit={handleManualSubmit}>
                            <Stack spacing={3}>
                                <TextField
                                    type="date"
                                    label="תאריך"
                                    value={manualDate}
                                    onChange={(e) => setManualDate(e.target.value)}
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                    inputProps={{ style: { textAlign: 'center' } }}
                                />
                                <Stack direction="row" spacing={2}>
                                    <TextField
                                        type="time"
                                        label="שעת התחלה"
                                        value={manualStartTime}
                                        onChange={(e) => setManualStartTime(e.target.value)}
                                        fullWidth
                                        InputLabelProps={{ shrink: true }}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                        inputProps={{ style: { textAlign: 'center' } }}
                                    />
                                    <TextField
                                        type="time"
                                        label="שעת סיום"
                                        value={manualEndTime}
                                        onChange={(e) => setManualEndTime(e.target.value)}
                                        fullWidth
                                        InputLabelProps={{ shrink: true }}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                        inputProps={{ style: { textAlign: 'center' } }}
                                    />
                                </Stack>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    size="large"
                                    startIcon={<EditCalendarRoundedIcon />}
                                    sx={{
                                        py: 1.5,
                                        borderRadius: 2,
                                        fontSize: '1.1rem'
                                    }}
                                >
                                    הוסף רישום ידני
                                </Button>
                            </Stack>
                        </Box>
                    )}
                </Stack>
            </Box>
        </Paper>
    );
}
