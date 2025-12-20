"use client";

import { Task } from "@/backend/firestore";
import { Gantt, Task as GanttTask, EventOption, StylingOption, ViewMode, DisplayOption } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import { useTheme } from "@mui/material";

interface TimelineChartProps {
    tasks: Task[];
    onTaskClick?: (task: Task) => void;
}

export default function TimelineChart({ tasks, onTaskClick }: TimelineChartProps) {
    const theme = useTheme();

    if (tasks.length === 0) {
        return <div style={{ textAlign: 'center', padding: '20px' }}>אין משימות להצגה</div>;
    }

    // Map Tasks to GanttTasks
    const ganttTasks: GanttTask[] = tasks.map(t => {
        // Safe access to dates
        const now = new Date();
        const created = t.createdAt ? new Date(t.createdAt) : now;

        // Determine start date
        let start = created;
        if (t.startDate) {
            const parsedStart = new Date(t.startDate);
            if (!isNaN(parsedStart.getTime())) {
                start = parsedStart;
            }
        }
        // Fallback for invalid start
        if (isNaN(start.getTime())) {
            start = now;
        }

        // Determine end date
        let end = new Date(start.getTime() + 86400000); // Default 1 day
        if (t.dueDate) {
            const parsedEnd = new Date(t.dueDate);
            if (!isNaN(parsedEnd.getTime())) {
                end = parsedEnd;
            }
        }
        // Ensure end >= start
        if (end <= start) {
            end = new Date(start.getTime() + 86400000);
        }

        // Progress based on status
        let progress = 0;
        if (t.status === 'done') progress = 100;
        else if (t.status === 'in-progress') progress = 50;

        return {
            start,
            end,
            name: t.name,
            id: t.id || Math.random().toString(),
            type: 'task',
            progress,
            isDisabled: false,
            styles: {
                progressColor: t.status === 'done' ? theme.palette.success.main : theme.palette.primary.main,
                progressSelectedColor: theme.palette.primary.dark,
                backgroundColor: theme.palette.mode === 'dark' ? '#1e293b' : '#f8fafc',
                backgroundSelectedColor: theme.palette.action.selected,
            },
            project: t.projectId // Group by project if needed, or mapped string
        };
    });

    return (
        <div style={{ direction: 'ltr', width: '100%', height: '500px', overflowX: 'auto' }}>
            <Gantt
                tasks={ganttTasks}
                viewMode={ViewMode.Day}
                locale="he"
                rtl={false}
                listCellWidth="155px"
                columnWidth={60}
                barFill={60}
                ganttHeight={500}
                onClick={(task) => {
                    const originalTask = tasks.find(t => t.id === task.id);
                    if (originalTask && onTaskClick) onTaskClick(originalTask);
                }}
            />
        </div>
    );
}
