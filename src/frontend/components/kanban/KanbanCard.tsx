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
            elevation={isDragging ? 4 : 1}
            sx={{
                p: 2,
                mb: 2,
                cursor: 'grab',
                '&:active': { cursor: 'grabbing' },
                backgroundColor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#fff',
                '&:hover': {
                    boxShadow: theme.shadows[3],
                    backgroundColor: theme.palette.mode === 'dark' ? '#2d2d2d' : '#fafafa'
                },
                borderLeft: `4px solid ${task.priority === 'high' ? theme.palette.error.main :
                    task.priority === 'low' ? theme.palette.success.main :
                        theme.palette.warning.main
                    }`,
                position: 'relative',
                direction: 'rtl', // Ensure RTL internal layout
                '&:hover .edit-button': { opacity: 1 }
            }}
        >
            <Stack spacing={1}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Typography variant="body1" fontWeight="medium" sx={{ wordBreak: 'break-word' }}>
                        {task.name}
                    </Typography>
                    {task.priority === 'high' && (
                        <Chip label="דחוף" size="small" color="error" sx={{ height: 20, fontSize: '0.7rem' }} />
                    )}
                </Box>

                {task.description && (
                    <Typography variant="body2" color="text.secondary" sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        fontSize: '0.85rem'
                    }}>
                        {task.description}
                    </Typography>
                )}

                <Divider sx={{ my: 0.5 }} />

                <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
                    {task.dueDate && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            📅 {new Date(task.dueDate).toLocaleDateString('he-IL')}
                        </Typography>
                    )}

                    {task.subTasks && task.subTasks.length > 0 && (
                        <Chip
                            label={`${task.subTasks.filter(st => st.status === 'completed').length}/${task.subTasks.length}`}
                            size="small"
                            variant="outlined"
                            color={task.subTasks.every(st => st.status === 'completed') ? 'success' : 'default'}
                            sx={{ height: 20, fontSize: '0.7rem' }}
                        />
                    )}
                </Box>
            </Stack>
        </Paper>
    );
}
