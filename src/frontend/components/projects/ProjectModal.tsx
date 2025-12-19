"use client";

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Stack,
    Box,
    Typography,
    IconButton,
    InputAdornment
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Project } from '@/backend/firestore';
import { useTheme } from '@mui/material/styles';

interface ProjectModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (projectData: Partial<Project>) => Promise<void>;
    project?: Project; // If provided, edit mode.
}

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD', '#D4A5A5', '#9B59B6', '#3498DB'];

export default function ProjectModal({ open, onClose, onSave, project }: ProjectModalProps) {
    const theme = useTheme();
    const [name, setName] = useState('');
    const [client, setClient] = useState('');
    const [hourlyRate, setHourlyRate] = useState<string>('');
    const [color, setColor] = useState(COLORS[0]);

    useEffect(() => {
        if (open) {
            if (project) {
                setName(project.name);
                setClient(project.client);
                setHourlyRate(project.hourlyRate.toString());
                setColor(project.color);
            } else {
                setName('');
                setClient('');
                setHourlyRate('');
                setColor(COLORS[Math.floor(Math.random() * COLORS.length)]);
            }
        }
    }, [open, project]);

    const handleSave = async () => {
        if (!name.trim()) return;

        const projectData: Partial<Project> = {
            name,
            client,
            hourlyRate: parseFloat(hourlyRate) || 0,
            color,
            status: project ? project.status : 'active'
        };

        await onSave(projectData);
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="sm"
            dir="rtl"
            PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
        >
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" component="div" fontWeight="bold">
                    {project ? 'ערוך פרויקט' : 'פרויקט חדש'}
                </Typography>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent>
                <Stack spacing={3} sx={{ mt: 1 }}>
                    <TextField
                        label="שם הפרויקט"
                        fullWidth
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />

                    <TextField
                        label="לקוח"
                        fullWidth
                        value={client}
                        onChange={(e) => setClient(e.target.value)}
                    />

                    <TextField
                        label="תעריף שעתי"
                        type="number"
                        fullWidth
                        value={hourlyRate}
                        onChange={(e) => setHourlyRate(e.target.value)}
                        slotProps={{
                            input: {
                                endAdornment: <InputAdornment position="end">₪</InputAdornment>,
                            }
                        }}
                    />

                    <Box>
                        <Typography variant="subtitle2" gutterBottom>צבע הפרויקט</Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                            {COLORS.map((c) => (
                                <Box
                                    key={c}
                                    onClick={() => setColor(c)}
                                    sx={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: '50%',
                                        bgcolor: c,
                                        cursor: 'pointer',
                                        border: color === c ? `3px solid ${theme.palette.primary.main}` : '3px solid transparent',
                                        transition: 'all 0.2s',
                                        '&:hover': { transform: 'scale(1.1)' }
                                    }}
                                />
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
    );
}
