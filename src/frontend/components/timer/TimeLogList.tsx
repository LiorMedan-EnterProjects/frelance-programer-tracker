import { useState } from 'react';
import {
    List,
    ListItem,
    ListItemText,
    Typography,
    Paper,
    Box,
    Chip,
    Stack,
    useTheme,
    alpha,
    IconButton,
    Tooltip
} from '@mui/material';
import HistoryToggleOffRoundedIcon from '@mui/icons-material/HistoryToggleOffRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import { TimeLog, Project, updateTimeLog } from '@/backend/firestore'; // Import updateTimeLog
import TimeLogModal from './TimeLogModal';

interface TimeLogListProps {
    logs: TimeLog[];
    projects: Project[];
    userId?: string; // Add userId prop
    onLogUpdated?: () => void; // Add callback
}

export default function TimeLogList({ logs, projects, userId, onLogUpdated }: TimeLogListProps) {
    const theme = useTheme();
    const [editingLog, setEditingLog] = useState<TimeLog | undefined>(undefined);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const getProjectName = (id: string) => {
        return projects.find(p => p.id === id)?.name || 'Unknown Project';
    };

    const getProjectColor = (id: string) => {
        return projects.find(p => p.id === id)?.color || theme.palette.grey[300];
    };

    const formatDuration = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        if (h > 0) return `${h}h ${m}m`;
        return `${m}m`;
    };

    const formatDate = (timestamp: any) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    };

    const formatTime = (timestamp: any) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const handleEditClick = (log: TimeLog) => {
        setEditingLog(log);
        setIsModalOpen(true);
    };

    const handleSaveLog = async (logData: any) => {
        if (!editingLog?.id) return;
        try {
            await updateTimeLog(editingLog.id, logData);
            setIsModalOpen(false);
            setEditingLog(undefined);
            if (onLogUpdated) onLogUpdated();
        } catch (error) {
            console.error("Failed to update log:", error);
        }
    };

    if (logs.length === 0) {
        return (
            <Paper
                elevation={0}
                sx={{
                    p: 4,
                    textAlign: 'center',
                    borderRadius: 4,
                    border: `1px solid ${theme.palette.divider}`,
                    background: theme.palette.background.paper,
                }}
            >
                <HistoryToggleOffRoundedIcon sx={{ fontSize: 64, color: theme.palette.text.disabled, mb: 2, opacity: 0.5 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                    אין פעילות עדיין
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    התחל את הטיימר כדי לעקוב אחר העבודה.
                </Typography>
            </Paper>
        );
    }

    return (
        <>
            <Stack spacing={2}>
                {logs.map((log) => (
                    <Paper
                        key={log.id}
                        elevation={0}
                        sx={{
                            p: 2,
                            borderRadius: 3,
                            border: `1px solid ${theme.palette.divider}`,
                            background: theme.palette.mode === 'dark'
                                ? alpha(theme.palette.common.white, 0.05)
                                : '#fff',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: theme.shadows[2],
                                background: alpha(theme.palette.background.paper, 0.95),
                                '& .edit-button': {
                                    opacity: 1,
                                    visibility: 'visible'
                                }
                            },
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box sx={{
                                width: 6,
                                height: 48,
                                bgcolor: getProjectColor(log.projectId),
                                ml: 2.5, // RTL
                                borderRadius: 4
                            }} />

                            <Box sx={{ flexGrow: 1 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                        {getProjectName(log.projectId)}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Chip
                                            icon={<AccessTimeRoundedIcon sx={{ fontSize: 16 }} />}
                                            label={formatDuration(log.duration)}
                                            size="small"
                                            sx={{
                                                fontWeight: 600,
                                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                                color: theme.palette.primary.main,
                                                border: 'none',
                                                direction: 'ltr'
                                            }}
                                        />
                                        <Tooltip title="ערוך">
                                            <IconButton
                                                size="small"
                                                className="edit-button"
                                                onClick={() => handleEditClick(log)}
                                                sx={{
                                                    opacity: 0,
                                                    visibility: 'hidden',
                                                    transition: 'all 0.2s',
                                                    color: 'text.secondary',
                                                    '&:hover': { color: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.1) }
                                                }}
                                            >
                                                <EditRoundedIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                </Box>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="body2" color="text.secondary" sx={{
                                        display: '-webkit-box',
                                        overflow: 'hidden',
                                        WebkitBoxOrient: 'vertical',
                                        WebkitLineClamp: 1,
                                        ml: 2
                                    }}>
                                        {log.description || 'אין תיאור'}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500, whiteSpace: 'nowrap', direction: 'ltr' }}>
                                        {formatDate(log.startTime)} • {formatTime(log.startTime)}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Paper>
                ))}
            </Stack>

            {userId && (
                <TimeLogModal
                    open={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveLog}
                    log={editingLog}
                    projects={projects}
                    userId={userId}
                />
            )}
        </>
    );
}
