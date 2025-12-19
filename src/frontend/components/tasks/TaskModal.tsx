"use client";

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem,
    Stack,
    Typography,
    Box,
    Chip,
    IconButton,
    InputAdornment
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { he } from 'date-fns/locale';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import { Task, SubTask } from '@/backend/firestore';

interface TaskModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (taskData: Partial<Task>) => Promise<void>;
    task?: Task; // If provided, edit mode. If not, create mode.
    defaultProjectId?: string;
}

export default function TaskModal({ open, onClose, onSave, task, defaultProjectId }: TaskModalProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
    const [dueDate, setDueDate] = useState<number | null>(null);
    const [subTasks, setSubTasks] = useState<SubTask[]>([]);
    const [newSubTaskName, setNewSubTaskName] = useState('');

    useEffect(() => {
        if (open) {
            if (task) {
                setName(task.name);
                setDescription(task.description || '');
                setPriority(task.priority || 'medium');
                setDueDate(task.dueDate || null);
                setSubTasks(task.subTasks || []);
            } else {
                // Reset for new task
                setName('');
                setDescription('');
                setPriority('medium');
                setDueDate(null);
                setSubTasks([]);
            }
        }
    }, [open, task]);

    const handleSave = async () => {
        if (!name.trim()) return;

        const taskData: Partial<Task> = {
            name,
            description,
            priority,
            dueDate,
            subTasks
        };

        await onSave(taskData);
        onClose();
    };

    const handleAddSubTask = () => {
        if (!newSubTaskName.trim()) return;
        const newSubTask: SubTask = {
            id: Math.random().toString(36).substr(2, 9),
            name: newSubTaskName,
            status: 'active'
        };
        setSubTasks([...subTasks, newSubTask]);
        setNewSubTaskName('');
    };

    const handleDeleteSubTask = (id: string) => {
        setSubTasks(subTasks.filter(st => st.id !== id));
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={he}>
            <Dialog
                open={open}
                onClose={onClose}
                fullWidth
                maxWidth="sm"
                dir="rtl"
                PaperProps={{
                    sx: { borderRadius: 3, p: 1 }
                }}
            >
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" fontWeight="bold">
                        {task ? 'ערוך משימה' : 'משימה חדשה'}
                    </Typography>
                    <IconButton onClick={onClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent>
                    <Stack spacing={3} sx={{ mt: 1 }}>
                        <TextField
                            label="שם המשימה"
                            fullWidth
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />

                        <TextField
                            label="תיאור"
                            fullWidth
                            multiline
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />

                        <Stack direction="row" spacing={2}>
                            <TextField
                                select
                                label="עדיפות"
                                value={priority}
                                onChange={(e) => setPriority(e.target.value as any)}
                                fullWidth
                            >
                                <MenuItem value="high">
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <Chip label="גבוהה" size="small" color="error" variant="outlined" />
                                    </Box>
                                </MenuItem>
                                <MenuItem value="medium">
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <Chip label="בינונית" size="small" color="warning" variant="outlined" />
                                    </Box>
                                </MenuItem>
                                <MenuItem value="low">
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <Chip label="נמוכה" size="small" color="success" variant="outlined" />
                                    </Box>
                                </MenuItem>
                            </TextField>

                            <DatePicker
                                label="תאריך יעד"
                                value={dueDate ? new Date(dueDate) : null}
                                onChange={(newValue: Date | null) => setDueDate(newValue ? newValue.getTime() : null)}
                                slotProps={{ textField: { fullWidth: true } }}
                            />
                        </Stack>

                        <Box>
                            <Typography variant="subtitle2" gutterBottom>תתי-משימות</Typography>
                            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                                <TextField
                                    placeholder="הוסף תת-משימה..."
                                    size="small"
                                    fullWidth
                                    value={newSubTaskName}
                                    onChange={(e) => setNewSubTaskName(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleAddSubTask()}
                                />
                                <Button
                                    variant="contained"
                                    onClick={handleAddSubTask}
                                    sx={{ minWidth: 'auto', px: 2 }}
                                >
                                    <AddIcon />
                                </Button>
                            </Stack>

                            <Stack spacing={1}>
                                {subTasks.map((st) => (
                                    <Box
                                        key={st.id}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            bgcolor: 'background.default',
                                            p: 1,
                                            borderRadius: 1,
                                            border: '1px solid',
                                            borderColor: 'divider'
                                        }}
                                    >
                                        <Typography variant="body2">{st.name}</Typography>
                                        <IconButton size="small" onClick={() => handleDeleteSubTask(st.id)} color="error">
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                ))}
                            </Stack>
                        </Box>
                    </Stack>
                </DialogContent>

                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={onClose} color="inherit">ביטול</Button>
                    <Button
                        onClick={handleSave}
                        variant="contained"
                        disabled={!name.trim()}
                    >
                        שמור
                    </Button>
                </DialogActions>
            </Dialog>
        </LocalizationProvider>
    );
}
