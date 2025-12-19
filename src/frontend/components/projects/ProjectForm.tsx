"use client";

import { useState } from 'react';
import {
    TextField,
    Button,
    Box,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Stack
} from '@mui/material';
import { Project } from '@/backend/firestore';

interface ProjectFormProps {
    onSubmit: (project: Omit<Project, 'id' | 'createdAt' | 'userId'>) => Promise<void>;
    initialData?: Partial<Project>;
}

export default function ProjectForm({ onSubmit, initialData }: ProjectFormProps) {
    const [name, setName] = useState(initialData?.name || '');
    const [client, setClient] = useState(initialData?.client || '');
    const [hourlyRate, setHourlyRate] = useState(initialData?.hourlyRate?.toString() || '');
    const [status, setStatus] = useState<Project['status']>(initialData?.status || 'active');
    const [color, setColor] = useState(initialData?.color || '#3f51b5');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await onSubmit({
                name,
                client,
                hourlyRate: parseFloat(hourlyRate) || 0,
                status,
                color,
            });
            // Reset form if not editing
            if (!initialData) {
                setName('');
                setClient('');
                setHourlyRate('');
                setStatus('active');
                setColor('#3f51b5');
            }
        } catch (error) {
            console.error("Error submitting project:", error);
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2, border: '1px solid #ddd', borderRadius: 2 }}>
            <TextField
                label="שם הפרויקט"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                fullWidth
                sx={{
                    '& .MuiInputLabel-root': {
                        width: '100%',
                        textAlign: 'center',
                        transformOrigin: 'center',
                        left: '0 !important',
                        right: '0 !important'
                    },
                    '& .MuiInputLabel-shrink': {
                        transform: 'translate(0, -1.5px) scale(0.75)',
                        maxWidth: '100%'
                    }
                }}
                inputProps={{ style: { textAlign: 'center' } }}
            />
            <TextField
                label="שם הלקוח"
                value={client}
                onChange={(e) => setClient(e.target.value)}
                fullWidth
                sx={{
                    '& .MuiInputLabel-root': {
                        width: '100%',
                        textAlign: 'center',
                        transformOrigin: 'center',
                        left: '0 !important',
                        right: '0 !important'
                    },
                    '& .MuiInputLabel-shrink': {
                        transform: 'translate(0, -1.5px) scale(0.75)',
                        maxWidth: '100%'
                    }
                }}
                inputProps={{ style: { textAlign: 'center' } }}
            />
            <TextField
                label="תעריף שעתי"
                type="number"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                fullWidth
                slotProps={{ htmlInput: { min: 0, step: 0.01, style: { textAlign: 'center' } } }}
                sx={{
                    '& .MuiInputLabel-root': {
                        width: '100%',
                        textAlign: 'center',
                        transformOrigin: 'center',
                        left: '0 !important',
                        right: '0 !important'
                    },
                    '& .MuiInputLabel-shrink': {
                        transform: 'translate(0, -1.5px) scale(0.75)',
                        maxWidth: '100%'
                    }
                }}
            />
            <FormControl fullWidth>
                <InputLabel sx={{
                    width: '100%',
                    textAlign: 'center',
                    transformOrigin: 'center',
                    left: '0 !important',
                    right: '0 !important',
                    '&.MuiInputLabel-shrink': {
                        transform: 'translate(0, -1.5px) scale(0.75)',
                        maxWidth: '100%'
                    }
                }}>סטטוס</InputLabel>
                <Select
                    value={status}
                    label="סטטוס"
                    onChange={(e) => setStatus(e.target.value as Project['status'])}
                    sx={{ textAlign: 'center' }}
                >
                    <MenuItem value="active" sx={{ justifyContent: 'center' }}>פעיל</MenuItem>
                    <MenuItem value="completed" sx={{ justifyContent: 'center' }}>הושלם</MenuItem>
                    <MenuItem value="archived" sx={{ justifyContent: 'center' }}>בארכיון</MenuItem>
                </Select>
            </FormControl>
            <Stack direction="row" alignItems="center" justifyContent="center" spacing={2}>
                <InputLabel>צבע</InputLabel>
                <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    style={{ width: 50, height: 50, padding: 0, border: 'none', cursor: 'pointer' }}
                />
            </Stack>
            <Button
                type="submit"
                variant="contained"
                // disabled={loading} // Removed loading state
                fullWidth
            >
                {initialData ? 'עדכן פרויקט' : 'צור פרויקט'}
            </Button>
        </Box>
    );
}
