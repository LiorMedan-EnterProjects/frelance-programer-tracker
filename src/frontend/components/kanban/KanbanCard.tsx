"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Paper, Typography, Box, Chip, IconButton, Stack, Divider, useTheme } from "@mui/material";
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import EditIcon from '@mui/icons-material/Edit';
import { Task } from "@/backend/firestore";

interface KanbanCardProps {
    task: Task;
    onEdit?: (task: Task) => void;
}

export default function KanbanCard({ task, onEdit }: KanbanCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: task.id! });

    const theme = useTheme();

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        touchAction: 'none' // Required for touch devices
    };

    return (
        <Paper
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            elevation={0}
            variant="outlined"
            sx={{
                p: 1.5,
                mb: 1, // Tighter spacing
                cursor: 'grab',
                '&:active': { cursor: 'grabbing' },
                backgroundColor: theme.palette.mode === 'dark' ? '#161b22' : '#ffffff', // GitHub Dark/Light bg
                borderColor: theme.palette.mode === 'dark' ? '#30363d' : '#d0d7de',
                borderRadius: 2,
                '&:hover': {
                    borderColor: theme.palette.primary.main,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
                },
                position: 'relative',
                direction: 'rtl'
            }}
        >
            <Box display="flex" flexDirection="column" gap={0.5}>
                {/* Header: Title and Priority Dot */}
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Typography
                        variant="body2"
                        fontWeight="600"
                        color="text.primary"
                        sx={{
                            wordBreak: 'break-word',
                            lineHeight: 1.4,
                            fontSize: '0.9rem'
                        }}
                    >
                        {task.name}
                    </Typography>

                    {onEdit && (
                        <Box
                            className="edit-button"
                            component="span"
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit(task);
                            }}
                            sx={{
                                opacity: 0,
                                transition: 'opacity 0.2s',
                                cursor: 'pointer',
                                padding: '2px',
                                borderRadius: '4px',
                                '&:hover': { bgcolor: 'action.hover' },
                                '.MuiPaper-root:hover &': { opacity: 1 } // Show on card hover
                            }}
                        >
                            <EditIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                        </Box>
                    )}
                </Box>

                {/* Subtitle / Metadata Row */}
                <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                    {/* Priority Indicator */}
                    {task.priority !== 'medium' && (
                        <Box display="flex" alignItems="center" title={`עדיפות ${task.priority === 'high' ? 'גבוהה' : 'נמוכה'}`}>
                            <Box sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                bgcolor: task.priority === 'high' ? 'error.main' : 'success.main',
                                mr: 0.5
                            }} />
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                                {task.priority === 'high' ? 'High' : 'Low'}
                            </Typography>
                        </Box>
                    )}

                    {task.dueDate && (
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            📅 {new Date(task.dueDate).toLocaleDateString('he-IL', { day: 'numeric', month: 'numeric' })}
                        </Typography>
                    )}

                    {task.subTasks && task.subTasks.length > 0 && (
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            ☑ {task.subTasks.filter(st => st.status === 'completed').length}/{task.subTasks.length}
                        </Typography>
                    )}
                </Box>

                {/* Optional: Minimal Description preview if exists */}
                {task.description && (
                    <Typography variant="caption" color="text.secondary" sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        mt: 0.5,
                        fontSize: '0.75rem'
                    }}>
                        {task.description}
                    </Typography>
                )}
            </Box>
        </Paper>
    );
}
