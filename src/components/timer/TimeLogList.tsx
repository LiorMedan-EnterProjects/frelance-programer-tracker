"use client";

import {
    List,
    ListItem,
    ListItemText,
    Typography,
    Paper,
    Box,
    Chip
} from '@mui/material';
import { TimeLog, Project } from '@/lib/firestore';

interface TimeLogListProps {
    logs: TimeLog[];
    projects: Project[];
}

export default function TimeLogList({ logs, projects }: TimeLogListProps) {
    const getProjectName = (id: string) => {
        return projects.find(p => p.id === id)?.name || 'Unknown Project';
    };

    const getProjectColor = (id: string) => {
        return projects.find(p => p.id === id)?.color || '#ccc';
    };

    const formatDuration = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        return `${h}h ${m}m`;
    };

    const formatDate = (timestamp: any) => {
        if (!timestamp) return '';
        // Handle Firestore Timestamp or Date object
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (logs.length === 0) {
        return (
            <Typography variant="body1" color="text.secondary" align="center">
                No time logs yet.
            </Typography>
        );
    }

    return (
        <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
            {logs.map((log) => (
                <Paper key={log.id} elevation={1} sx={{ mb: 1 }}>
                    <ListItem>
                        <Box sx={{
                            width: 8,
                            height: 40,
                            bgcolor: getProjectColor(log.projectId),
                            mr: 2,
                            borderRadius: 1
                        }} />
                        <ListItemText
                            primary={
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="subtitle1">{getProjectName(log.projectId)}</Typography>
                                    <Typography variant="body2" color="text.secondary">{formatDate(log.startTime)}</Typography>
                                </Box>
                            }
                            secondary={
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        {log.description || 'No description'}
                                    </Typography>
                                    <Chip label={formatDuration(log.duration)} size="small" variant="outlined" />
                                </Box>
                            }
                        />
                    </ListItem>
                </Paper>
            ))}
        </List>
    );
}
