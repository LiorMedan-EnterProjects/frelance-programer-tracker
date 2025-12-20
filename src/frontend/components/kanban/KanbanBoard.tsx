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

import TaskModal from "../tasks/TaskModal";

interface KanbanBoardProps {
    tasks: Task[];
    userId: string;
    projectId: string;
    onTasksChange: (tasks: Task[]) => void;
    onEditTask?: (task: Task) => void;
    onDeleteTask?: (taskId: string) => void;
    onAddTask?: (
        status: 'todo' | 'in-progress' | 'done',
        name: string,
        description?: string,
        priority?: 'high' | 'medium' | 'low',
        dueDate?: number | null
    ) => Promise<void>;
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

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState<Task | undefined>(undefined);
    const [modalDefaultStatus, setModalDefaultStatus] = useState<'todo' | 'in-progress' | 'done'>('todo');

    const handleAddTaskClick = (status: 'todo' | 'in-progress' | 'done') => {
        setTaskToEdit(undefined);
        setModalDefaultStatus(status);
        setIsModalOpen(true);
    };

    const handleEditTaskClick = (task: Task) => {
        setTaskToEdit(task);
        setIsModalOpen(true);
    };

    const handleModalSave = async (taskData: Partial<Task>) => {
        if (taskToEdit) {
            // Edit existing
            if (onEditTask) {
                // In a real app we might want a dedicated updateTask prop that accepts partials,
                // but for now we can merge locally or let valid onEditTask handle it.
                // Actually, onEditTask signature in Props implies updating the full object or similar.
                // Let's assume onEditTask expects a Task object.
                const updatedTask = { ...taskToEdit, ...taskData };
                onEditTask(updatedTask);
            }
        } else if (onAddTask) {
            // Create new
            // onAddTask currently only takes status and name. We need to support more fields.
            // We'll updated the prop signature below or just pass what we can for now, 
            // but ideally we should update the interface.
            // Let's rely on the parent updating or just calling the API directly if we had the callback.
            // Since onAddTask is limited signature, we might need to refactor KanbanBoardProps
            // or we force the parent to accept an object.
            // For this step, I'll update the prop signature in the same file to be flexible.
            await onAddTask(modalDefaultStatus, taskData.name!, taskData.description, taskData.priority, taskData.dueDate);
        }
    };

    // ... existing DND logic ...

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <div dir="rtl" style={{ height: '100%' }}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ height: '100%', alignItems: 'flex-start' }}>
                    {columns.map((col) => (
                        <KanbanColumn
                            key={col.id}
                            id={col.id}
                            title={col.title}
                            tasks={getTasksByStatus(col.id)}
                            color={col.color}
                            onEditTask={handleEditTaskClick}
                            onAddTask={() => handleAddTaskClick(col.id)}
                        />
                    ))}
                </Stack>
            </div>

            {createPortal(
                <DragOverlay>
                    {activeId ? (
                        <KanbanCard task={tasks.find(t => t.id === activeId)!} />
                    ) : null}
                </DragOverlay>,
                document.body
            )}

            <TaskModal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleModalSave}
                task={taskToEdit}
                defaultProjectId={projectId}
            />
        </DndContext>
    );
}
