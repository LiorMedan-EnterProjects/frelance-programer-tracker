"use client";

import { useState } from 'react';
import {
    Button, Dialog, DialogTitle, DialogContent, DialogActions,
    FormControl, InputLabel, Select, MenuItem, TextField, Box,
    Typography, Stack, IconButton
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import StopRoundedIcon from '@mui/icons-material/StopRounded';
import CloseIcon from '@mui/icons-material/Close';
import EditCalendarRoundedIcon from '@mui/icons-material/EditCalendarRounded';
import { useTimer } from '../../context/TimerContext';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import TimeLogModal from './TimeLogModal';
import { addTimeLog } from '@/backend/firestore';

export default function TimerDialogTrigger() {
    const [open, setOpen] = useState(false);
    const [openManual, setOpenManual] = useState(false);

    const {
        isRunning, elapsedTime,
        selectedProject, selectedTaskId, description,
        setSelectedProject, setSelectedTaskId, setDescription,
        startTimer, stopTimer, projectTasks
    } = useTimer();
    const { projects, refreshData } = useData();
    const { user } = useAuth();
    const userId = user?.uid;

    // Determine current project name
    const currentProjectName = projects.find(p => p.id === selectedProject)?.name || "בחר פרויקט";

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleStart = () => {
        startTimer();
    };

    const handleStop = async () => {
        await stopTimer();
        setOpen(false);
    };

    const handleManualSubmit = async (logData: any) => {
        if (!userId) return;
        try {
            await addTimeLog({
                ...logData,
                userId
            });
            await refreshData();
            setOpenManual(false);
            setOpen(false);
            alert("הדיווח נוסף בהצלחה!");
        } catch (error) {
            console.error("Error saving manual log:", error);
        }
    };

    return (
        <>
            {/* The Trigger Button */}
            <Button
                variant={isRunning ? "contained" : "outlined"}
                color={isRunning ? "error" : "primary"}
                onClick={() => setOpen(true)}
                sx={{
                    minWidth: 140,
                    gap: 1,
                    animation: isRunning ? 'pulse 2s infinite' : 'none',
                    '@keyframes pulse': {
                        '0%': { boxShadow: '0 0 0 0 rgba(239, 68, 68, 0.4)' },
                        '70%': { boxShadow: '0 0 0 10px rgba(239, 68, 68, 0)' },
                        '100%': { boxShadow: '0 0 0 0 rgba(239, 68, 68, 0)' }
                    }
                }}
            >
                <AccessTimeIcon />
                {isRunning ? formatTime(elapsedTime) : "שעון נוכחות"}
            </Button>

            {/* The Modal Dialog */}
            <Dialog
                open={open}
                onClose={() => setOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box display="flex" alignItems="center" gap={1}>
                        <AccessTimeIcon />
                        שעון נוכחות
                    </Box>
                    <IconButton onClick={() => setOpen(false)}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent dividers>
                    <Box sx={{ textAlign: 'center', mb: 2 }}>
                        <Typography variant="h2" sx={{ fontFamily: 'monospace', fontWeight: 'bold', color: isRunning ? 'error.main' : 'text.primary', mb: 1 }}>
                            {formatTime(elapsedTime)}
                        </Typography>
                        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
                            {isRunning ? "פעיל כרגע" : "מוכן להתחלה"}
                        </Typography>

                        {/* Manual Entry Button */}
                        <Button
                            color="inherit"
                            size="small"
                            startIcon={<EditCalendarRoundedIcon />}
                            onClick={() => setOpenManual(true)}
                            sx={{ opacity: 0.7 }}
                        >
                            שכחת להפעיל? הזנה ידנית
                        </Button>
                    </Box>

                    <Stack spacing={3} mt={2}>
                        <FormControl fullWidth disabled={isRunning}>
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

                        <FormControl fullWidth disabled={isRunning || !selectedProject}>
                            <InputLabel>משימה</InputLabel>
                            <Select
                                value={selectedTaskId}
                                label="משימה"
                                onChange={(e) => setSelectedTaskId(e.target.value)}
                            >
                                <MenuItem value=""><em>ללא משימה</em></MenuItem>
                                {projectTasks.map((t) => (
                                    <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <TextField
                            label="תיאור (אופציונלי)"
                            fullWidth
                            multiline
                            rows={2}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            disabled={isRunning && elapsedTime > 0}
                        />
                    </Stack>
                </DialogContent>

                <DialogActions sx={{ p: 3 }}>
                    {!isRunning ? (
                        <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            size="large"
                            startIcon={<PlayArrowRoundedIcon />}
                            onClick={handleStart}
                            disabled={!selectedProject}
                        >
                            התחל מדידה
                        </Button>
                    ) : (
                        <Button
                            variant="contained"
                            color="error"
                            fullWidth
                            size="large"
                            startIcon={<StopRoundedIcon />}
                            onClick={handleStop}
                        >
                            סיים עבודה
                        </Button>
                    )}
                </DialogActions>
            </Dialog>

            <TimeLogModal
                open={openManual}
                onClose={() => setOpenManual(false)}
                onSave={handleManualSubmit}
                projects={projects}
                userId={userId || ''}
            />
        </>
    );
}
