"use client";

import { useState } from 'react';
import { Box, Paper, Stack, Typography, Button, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import TimelineChart from './TimelineChart';
import { useData } from '../../context/DataContext';
import { Task, addTask, updateTask } from '@/backend/firestore';
import TaskModal from '../tasks/TaskModal';
import { useAuth } from '../../context/AuthContext';

export default function RoadmapBoard() {
    const { tasks, projects, refreshData, createNewProject } = useData();
    const { user } = useAuth();
    const [selectedProjectId, setSelectedProjectId] = useState<string>('all');

    // Task Modal State
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);

    const handleAddTaskClick = () => {
        setEditingTask(undefined);
        setIsTaskModalOpen(true);
    };

    const handleTaskClick = (task: Task) => {
        setEditingTask(task);
        setIsTaskModalOpen(true);
    };

    const handleSaveTask = async (taskData: Partial<Task>) => {
        if (!user) return;
        try {
            if (editingTask?.id) {
                // Update
                if (editingTask.projectId) {
                    await updateTask(user.uid, editingTask.projectId, editingTask.id, taskData);
                }
            } else {
                // Create
                // Default to first project if none selected or 'all'
                let projectId = selectedProjectId !== 'all' ? selectedProjectId : projects[0]?.id;

                // If user accidentally tries to create without projects
                if (!projectId) {
                    alert("נא ליצור פרויקט תחילה");
                    return;
                }

                await addTask(
                    user.uid,
                    projectId,
                    taskData.name!,
                    taskData.description,
                    taskData.priority,
                    taskData.dueDate,
                    'todo',
                    taskData.startDate // Pass startDate
                );
            }
            await refreshData();
            setIsTaskModalOpen(false);
        } catch (error) {
            console.error("Error saving task:", error);
        }
    };

    // Filter tasks
    const filteredTasks = selectedProjectId === 'all'
        ? tasks
        : tasks.filter(t => t.projectId === selectedProjectId);

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h4" fontWeight="bold">מפת דרכים</Typography>

                <Box sx={{ display: 'flex', gap: 2 }}>
                    <FormControl sx={{ minWidth: 200 }}>
                        <InputLabel>סינון לפי פרויקט</InputLabel>
                        <Select
                            value={selectedProjectId}
                            label="סינון לפי פרויקט"
                            onChange={(e) => setSelectedProjectId(e.target.value)}
                            size="small"
                        >
                            <MenuItem value="all"><em>כל הפרויקטים</em></MenuItem>
                            {projects.map((p) => (
                                <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Button
                        startIcon={<AddIcon />}
                        variant="contained"
                        onClick={handleAddTaskClick}
                    >
                        משימה חדשה
                    </Button>
                </Box>
            </Box>

            {/* Timeline */}
            <Paper sx={{ flexGrow: 1, p: 2, borderRadius: 3, overflow: 'hidden' }}>
                <TimelineChart tasks={filteredTasks} onTaskClick={handleTaskClick} />
            </Paper>

            {/* Task Modal */}
            <TaskModal
                open={isTaskModalOpen}
                onClose={() => setIsTaskModalOpen(false)}
                onSave={handleSaveTask}
                task={editingTask}
                defaultProjectId={selectedProjectId !== 'all' ? selectedProjectId : undefined}
            />
        </Box>
    );
}
