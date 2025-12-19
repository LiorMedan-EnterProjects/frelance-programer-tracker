"use client";

import {
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    IconButton,
    Typography,
    Chip,
    Paper,
    Box,
    LinearProgress
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { Project, TimeLog, Task } from '@/backend/firestore';

interface ProjectListProps {
    projects: Project[];
    logs?: TimeLog[];
    tasks?: Task[];
    onDelete: (id: string) => void;
    onEdit?: (project: Project) => void;
}

export default function ProjectList({ projects, logs = [], tasks = [], onDelete, onEdit }: ProjectListProps) {
    if (projects.length === 0) {
        return (
            <Typography variant="body1" color="text.secondary" align="center" sx={{ mt: 4 }}>
                לא נמצאו פרויקטים. צור אחד חדש כדי להתחיל!
            </Typography>
        );
    }

    return (
        <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
            {projects.map((project) => {
                // Calculate stats for this project
                const projectLogs = logs.filter(log => log.projectId === project.id);
                const totalHours = projectLogs.reduce((acc, log) => acc + (log.duration / 3600), 0);
                const totalEarnings = totalHours * (project.hourlyRate || 0);

                // Calculate Progress
                const projectTasks = tasks.filter(t => t.projectId === project.id);
                const completedTasks = projectTasks.filter(t => t.status === 'done').length;
                const progress = projectTasks.length > 0 ? (completedTasks / projectTasks.length) * 100 : 0;

                return (
                    <Paper key={project.id} elevation={1} sx={{ mb: 2 }}>
                        <ListItem
                            secondaryAction={
                                <Box onClick={(e) => e.stopPropagation()}>
                                    {onEdit && (
                                        <IconButton edge="end" aria-label="edit" onClick={() => onEdit(project)} sx={{ ml: 1 }}>
                                            <EditIcon />
                                        </IconButton>
                                    )}
                                    <IconButton edge="end" aria-label="delete" onClick={() => project.id && onDelete(project.id)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </Box>
                            }
                            disablePadding
                        >
                            <ListItemButton
                                component="a"
                                onClick={() => window.location.href = `/projects/${project.id}`}
                                sx={{ textAlign: 'right', flexDirection: 'column', alignItems: 'stretch' }} // Changed layout
                            >
                                <Box display="flex" width="100%" alignItems="center" justifyContent="flex-end">
                                    <Box sx={{
                                        width: 12,
                                        height: 12,
                                        borderRadius: '50%',
                                        bgcolor: project.color,
                                        ml: 2,
                                        flexShrink: 0
                                    }} />
                                    <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                        <Typography variant="h6">{project.name}</Typography>
                                        <Chip
                                            label={project.status === 'active' ? 'פעיל' : project.status === 'completed' ? 'הושלם' : 'בארכיון'}
                                            size="small"
                                            color={project.status === 'active' ? 'success' : project.status === 'completed' ? 'default' : 'warning'}
                                            variant="outlined"
                                        />
                                    </Box>
                                </Box>

                                <Box sx={{ mt: 1, pr: 3.5, width: '100%' }}>
                                    <Typography component="div" variant="body2" color="text.primary">
                                        {project.client} {project.hourlyRate ? `— ₪${project.hourlyRate}/שעה` : ''}
                                    </Typography>

                                    {totalHours > 0 && (
                                        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                                            <Typography variant="body2" color="primary" fontWeight="bold">
                                                סה״כ: {totalHours.toFixed(1)} שעות
                                            </Typography>
                                            <Typography variant="body2" color="success.main" fontWeight="bold">
                                                רווח: ₪{totalEarnings.toFixed(2)}
                                            </Typography>
                                        </Box>
                                    )}

                                    {projectTasks.length > 0 && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.5 }}>
                                            <LinearProgress
                                                variant="determinate"
                                                value={progress}
                                                sx={{ flexGrow: 1, height: 6, borderRadius: 3 }}
                                            />
                                            <Typography variant="caption" color="text.secondary">
                                                {Math.round(progress)}%
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                            </ListItemButton>
                        </ListItem>
                    </Paper>
                );
            })}
        </List>
    );
}
