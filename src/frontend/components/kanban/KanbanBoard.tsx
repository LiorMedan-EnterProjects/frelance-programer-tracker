"use client";

import { useState, useEffect } from "react";
import {
    DndContext,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    defaultDropAnimationSideEffects,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { Box, Stack, useTheme } from "@mui/material";
import { Task, updateTaskStatus } from "@/backend/firestore";
import KanbanColumn from "./KanbanColumn";
import KanbanCard from "./KanbanCard";
import { createPortal } from "react-dom";

interface KanbanBoardProps {
    tasks: Task[];
    userId: string;
    projectId: string;
    onTasksChange: (tasks: Task[]) => void;
    onEditTask?: (task: Task) => void;
    onDeleteTask?: (taskId: string) => void;
    onAddTask?: (status: 'todo' | 'in-progress' | 'done', name: string) => Promise<void>;
}

export default function KanbanBoard({ tasks, userId, projectId, onTasksChange, onEditTask, onDeleteTask, onAddTask }: KanbanBoardProps) {
    const theme = useTheme();

    // Separate tasks by status
    const [activeId, setActiveId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5, // Prevent drag on simple clicks
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const columns: { id: 'todo' | 'in-progress' | 'done', title: string, color: string }[] = [
        { id: 'todo', title: 'לביצוע', color: theme.palette.info.main },
        { id: 'in-progress', title: 'בעבודה', color: theme.palette.warning.main },
        { id: 'done', title: 'בוצע', color: theme.palette.success.main },
    ];

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        // Find the containers (columns) of the active and over items
        const activeTask = tasks.find(t => t.id === activeId);
        const overTask = tasks.find(t => t.id === overId);

        if (!activeTask) return;

        // Moving between columns logic is often handled in DragEnd for simplicity in React state,
        // but for smooth visual sortable across columns, we might need it here.
        // For this implementation, I'll rely on DragEnd to simplify state complexity first.
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        const activeTask = tasks.find(t => t.id === activeId);
        if (!activeTask) return;

        // Determine new status
        let newStatus = activeTask.status;

        // 1. Dropped directly on a column
        if (columns.some(col => col.id === overId)) {
            newStatus = overId as any;
        }
        // 2. Dropped on another card
        else {
            const overTask = tasks.find(t => t.id === overId);
            if (overTask) {
                newStatus = overTask.status;
            }
        }

        // If status changed
        if (activeTask.status !== newStatus) {
            // Optimistic Update
            const updatedTasks = tasks.map(t =>
                t.id === activeId ? { ...t, status: newStatus } : t
            );
            onTasksChange(updatedTasks);

            // API Update
            try {
                await updateTaskStatus(userId, projectId, activeId, newStatus);
            } catch (error) {
                console.error("Failed to update task status", error);
                // Revert or show toast on error
            }
        }

        // TODO: Implement reordering within the same column (requires 'order' field in DB)
    };

    const getTasksByStatus = (status: string) => tasks.filter(t => t.status === status);

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ height: '100%', alignItems: 'flex-start', direction: 'rtl' }}>
                {columns.map((col) => (
                    <KanbanColumn
                        key={col.id}
                        id={col.id}
                        title={col.title}
                        tasks={getTasksByStatus(col.id)}
                        color={col.color}
                        onEditTask={onEditTask}
                        onAddTask={onAddTask}
                    // onDeleteTask={onDeleteTask} // TODO: Add to KanbanColumn
                    />
                ))}
            </Stack>

            {createPortal(
                <DragOverlay>
                    {activeId ? (
                        <KanbanCard task={tasks.find(t => t.id === activeId)!} />
                    ) : null}
                </DragOverlay>,
                document.body
            )}
        </DndContext>
    );
}
