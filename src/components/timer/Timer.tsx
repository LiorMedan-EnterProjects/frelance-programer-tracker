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
    Tab
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import { Project, addTimeLog, TimeLog } from '@/lib/firestore';
import { Timestamp } from 'firebase/firestore';

interface TimerProps {
    projects: Project[];
    userId: string;
    onLogAdded: () => void;
}

export default function Timer({ projects, userId, onLogAdded }: TimerProps) {
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
            alert("Please select a project first.");
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
            alert("Please select a project.");
            return;
        }

        const start = new Date(`${manualDate}T${manualStartTime}`);
        const end = new Date(`${manualDate}T${manualEndTime}`);
        const duration = Math.floor((end.getTime() - start.getTime()) / 1000);

        if (duration <= 0) {
            alert("End time must be after start time.");
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
        <Paper sx={{ p: 3, mb: 4 }}>
            <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 3 }}>
                <Tab label="Timer" />
                <Tab label="Manual Entry" />
            </Tabs>

            <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Project</InputLabel>
                <Select
                    value={selectedProject}
                    label="Project"
                    onChange={(e) => setSelectedProject(e.target.value)}
                    disabled={isRunning}
                >
                    {projects.map((p) => (
                        <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                    ))}
                </Select>
            </FormControl>

            <TextField
                label="Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                fullWidth
                sx={{ mb: 2 }}
            />

            {tabValue === 0 ? (
                <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h2" sx={{ fontFamily: 'monospace', mb: 2 }}>
                        {formatTime(elapsedTime)}
                    </Typography>
                    {!isRunning ? (
                        <Button
                            variant="contained"
                            color="primary"
                            size="large"
                            startIcon={<PlayArrowIcon />}
                            onClick={handleStart}
                            disabled={!selectedProject}
                        >
                            Start Timer
                        </Button>
                    ) : (
                        <Button
                            variant="contained"
                            color="error"
                            size="large"
                            startIcon={<StopIcon />}
                            onClick={handleStop}
                        >
                            Stop Timer
                        </Button>
                    )}
                </Box>
            ) : (
                <Box component="form" onSubmit={handleManualSubmit}>
                    <Stack spacing={2}>
                        <TextField
                            type="date"
                            label="Date"
                            value={manualDate}
                            onChange={(e) => setManualDate(e.target.value)}
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                        />
                        <Stack direction="row" spacing={2}>
                            <TextField
                                type="time"
                                label="Start Time"
                                value={manualStartTime}
                                onChange={(e) => setManualStartTime(e.target.value)}
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                            />
                            <TextField
                                type="time"
                                label="End Time"
                                value={manualEndTime}
                                onChange={(e) => setManualEndTime(e.target.value)}
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                            />
                        </Stack>
                        <Button type="submit" variant="contained">
                            Add Entry
                        </Button>
                    </Stack>
                </Box>
            )}
        </Paper>
    );
}
