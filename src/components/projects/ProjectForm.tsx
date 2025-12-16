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
import { Project } from '@/lib/firestore';

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
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
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
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2, border: '1px solid #ddd', borderRadius: 2 }}>
            <TextField
                label="Project Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                fullWidth
            />
            <TextField
                label="Client Name"
                value={client}
                onChange={(e) => setClient(e.target.value)}
                fullWidth
            />
            <TextField
                label="Hourly Rate"
                type="number"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                fullWidth
                slotProps={{ htmlInput: { min: 0, step: 0.01 } }}
            />
            <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                    value={status}
                    label="Status"
                    onChange={(e) => setStatus(e.target.value as Project['status'])}
                >
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="archived">Archived</MenuItem>
                </Select>
            </FormControl>
            <Stack direction="row" alignItems="center" spacing={2}>
                <InputLabel>Color Code</InputLabel>
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
                disabled={loading}
                fullWidth
            >
                {loading ? 'Saving...' : (initialData ? 'Update Project' : 'Create Project')}
            </Button>
        </Box>
    );
}
