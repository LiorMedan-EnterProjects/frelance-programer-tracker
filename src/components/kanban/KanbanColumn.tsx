"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Box, Typography, Paper, useTheme, alpha, Chip, Button, TextField } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import { Task } from "@/lib/firestore";
import KanbanCard from "./KanbanCard";
import { useState } from "react";

interface KanbanColumnProps {
    id: 'todo' | 'in-progress' | 'done';
    title: string;
    tasks: Task[];
    color: string;
    onEditTask?: (task: Task) => void;
    onAddTask?: (status: 'todo' | 'in-progress' | 'done', name: string) => Promise<void>;
}

export default function KanbanColumn({ id, title, tasks, color, onEditTask, onAddTask }: KanbanColumnProps) {
    const { setNodeRef } = useDroppable({ id });
    const theme = useTheme();
    const [isAdding, setIsAdding] = useState(false);
    const [newTaskName, setNewTaskName] = useState("");

    const handleQuickAdd = async () => {
        if (!newTaskName.trim() || !onAddTask) return;
        await onAddTask(id, newTaskName);
        setNewTaskName("");
        setIsAdding(false);
    };

    return (
        <Paper
            sx={{
                flex: 1,
                minWidth: 320,
                // Glassmorphism
                bgcolor: alpha(theme.palette.background.paper, 0.4),
                backdropFilter: 'blur(12px)',
                boxShadow: theme.shadows[2],
                borderRadius: 4,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                maxHeight: 'calc(100vh - 200px)', // Fixed height container
                transition: 'all 0.3s ease',
                '&:hover': {
                    bgcolor: alpha(theme.palette.background.paper, 0.6),
                    boxShadow: theme.shadows[4],
                }
            }}
        >
            {/* Header */}
            <Box sx={{
                p: 2.5,
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                direction: 'rtl'
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: color,
                        boxShadow: `0 0 10px ${alpha(color, 0.5)}`
                    }} />
                    <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '1.1rem' }}>
                        {title}
                    </Typography>
                </Box>
                <Chip
                    label={tasks.length}
                    size="small"
                    sx={{
                        bgcolor: alpha(color, 0.1),
                        color: color,
                        fontWeight: 'bold',
                        height: 24
                    }}
                />
            </Box>

            {/* Task List (Droppable Area) */}
            <Box
                ref={setNodeRef}
                sx={{
                    p: 2,
                    flexGrow: 1,
                    overflowY: 'auto',
                    minHeight: 150,
                    // Custom scrollbar
                    '&::-webkit-scrollbar': { width: 6 },
                    '&::-webkit-scrollbar-thumb': {
                        bgcolor: alpha(theme.palette.text.disabled, 0.2),
                        borderRadius: 3
                    }
                }}
            >
                <SortableContext
                    id={id}
                    items={tasks.map(t => t.id!)}
                    strategy={verticalListSortingStrategy}
                >
                    {tasks.map((task) => (
                        <KanbanCard key={task.id} task={task} onEdit={onEditTask} />
                    ))}
                </SortableContext>
            </Box>

            {/* Quick Add Footer */}
            {onAddTask && (
                <Box sx={{ p: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                    {isAdding ? (
                        <Box component="form" onSubmit={(e) => { e.preventDefault(); handleQuickAdd(); }}>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="שם המשימה..."
                                value={newTaskName}
                                onChange={(e) => setNewTaskName(e.target.value)}
                                autoFocus
                                onBlur={() => !newTaskName && setIsAdding(false)}
                                sx={{
                                    mb: 1,
                                    '& .MuiOutlinedInput-root': { bgcolor: 'background.paper' }
                                }}
                            />
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                <Button size="small" onClick={() => setIsAdding(false)}>ביטול</Button>
                                <Button size="small" variant="contained" type="submit" disabled={!newTaskName.trim()}>הוסף</Button>
                            </Box>
                        </Box>
                    ) : (
                        <Button
                            fullWidth
                            startIcon={<AddIcon />}
                            onClick={() => setIsAdding(true)}
                            sx={{
                                justifyContent: 'flex-start',
                                color: 'text.secondary',
                                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05), color: 'primary.main' }
                            }}
                        >
                            הוסף משימה
                        </Button>
                    )}
                </Box>
            )}
        </Paper>
    );
}
