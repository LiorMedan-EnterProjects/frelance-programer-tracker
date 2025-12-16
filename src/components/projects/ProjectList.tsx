"use client";

import {
    List,
    ListItem,
    ListItemText,
    IconButton,
    Typography,
    Chip,
    Paper,
    Box
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { Project } from '@/lib/firestore';

interface ProjectListProps {
    projects: Project[];
    onDelete: (id: string) => void;
    onEdit?: (project: Project) => void;
}

export default function ProjectList({ projects, onDelete, onEdit }: ProjectListProps) {
    if (projects.length === 0) {
        return (
            <Typography variant="body1" color="text.secondary" align="center" sx={{ mt: 4 }}>
                No projects found. Start by creating one!
            </Typography>
        );
    }

    return (
        <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
            {projects.map((project) => (
                <Paper key={project.id} elevation={1} sx={{ mb: 2 }}>
                    <ListItem
                        secondaryAction={
                            <Box>
                                {onEdit && (
                                    <IconButton edge="end" aria-label="edit" onClick={() => onEdit(project)} sx={{ mr: 1 }}>
                                        <EditIcon />
                                    </IconButton>
                                )}
                                <IconButton edge="end" aria-label="delete" onClick={() => project.id && onDelete(project.id)}>
                                    <DeleteIcon />
                                </IconButton>
                            </Box>
                        }
                    >
                        <Box sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            bgcolor: project.color,
                            mr: 2,
                            flexShrink: 0
                        }} />
                        <ListItemText
                            primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="h6">{project.name}</Typography>
                                    <Chip
                                        label={project.status}
                                        size="small"
                                        color={project.status === 'active' ? 'success' : project.status === 'completed' ? 'default' : 'warning'}
                                        variant="outlined"
                                    />
                                </Box>
                            }
                            secondary={
                                <>
                                    <Typography component="span" variant="body2" color="text.primary">
                                        {project.client}
                                    </Typography>
                                    {` — $${project.hourlyRate}/hr`}
                                </>
                            }
                        />
                    </ListItem>
                </Paper>
            ))}
        </List>
    );
}
