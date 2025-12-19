"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Paper, Typography, Box, Chip, IconButton } from "@mui/material";
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import EditIcon from '@mui/icons-material/Edit';
import { Task } from "@/lib/firestore";

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
                position: 'relative',
                direction: 'rtl', // Ensure RTL internal layout
                '&:hover .edit-button': { opacity: 1 }
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <DragIndicatorIcon sx={{ color: 'text.disabled', fontSize: 16, mr: -0.5, mt: 0.5, cursor: 'grab' }} />
                <Typography variant="subtitle1" fontWeight="medium" sx={{ flexGrow: 1, mr: 1, ml: 1 }}>
                    {task.name}
                </Typography>
                {onEdit && (
                    <IconButton
                        size="small"
                        className="edit-button"
                        onClick={(e) => {
                            e.stopPropagation(); // Prevent drag start when clicking edit
                            onEdit(task);
                        }}
                        sx={{ opacity: 0, transition: 'opacity 0.2s' }}
                    >
                        <EditIcon fontSize="small" />
                    </IconButton>
                )}
            </Box>

            {task.subTasks && task.subTasks.length > 0 && (
                <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                    <Chip
                        label={`${task.subTasks.filter(st => st.isCompleted).length}/${task.subTasks.length}`}
                        size="small"
                        variant="outlined"
                        color={task.subTasks.every(st => st.isCompleted) ? 'success' : 'default'}
                        sx={{ height: 20, fontSize: '0.7rem' }}
                    />
                </Box>
            )}
        </Paper>
    );
}
