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
        // Determine start date: usage startDate > createdAt
        let start = new Date(t.createdAt);
        if (t.startDate) {
            start = new Date(t.startDate);
        }

        // Determine end date: dueDate > start + 1 day
        let end = new Date(start.getTime() + 86400000); // Default 1 day
        if (t.dueDate) {
            end = new Date(t.dueDate);
            // Ensure end >= start
            if (end < start) end = new Date(start.getTime() + 86400000);
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
        <div style={{ direction: 'ltr', overflowX: 'auto' }}>
            <Gantt
                tasks={ganttTasks}
                viewMode={ViewMode.Day}
                locale="he"
                rtl={false} // Library RTL support can be sketchy, keeping LTR for chart mechanic but Hebrew text
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
