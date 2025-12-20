"use client";

import { Task } from "@/backend/firestore";
import { Gantt, Task as GanttTask, EventOption, StylingOption, ViewMode, DisplayOption } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import "./roadmap.css"; // Custom overrides
import { useTheme } from "@mui/material";

interface TimelineChartProps {
    tasks: Task[];
    onTaskClick?: (task: Task) => void;
}

const HebrewTaskListHeader: React.FC<{ headerHeight: number; rowWidth: string; fontFamily: string; fontSize: string }> = ({ headerHeight, fontFamily, fontSize, rowWidth }) => {
    return (
        <div
            style={{
                height: headerHeight,
                fontFamily: "inherit",
                fontSize,
                display: "flex",
                fontWeight: "bold",
                borderBottom: "1px solid #475569", // Slate-600
                backgroundColor: "#1e293b", // Slate-800
                color: "#f8fafc", // Slate-50
                direction: "rtl",
                boxSizing: 'border-box'
            }}
        >
            <div style={{ flex: 1, minWidth: "155px", padding: "0 8px", display: "flex", alignItems: "center", borderLeft: "1px solid #475569" }}>
                משימה
            </div>
            <div style={{ width: "80px", padding: "0 8px", display: "flex", alignItems: "center", borderLeft: "1px solid #475569" }}>
                התחלה
            </div>
            <div style={{ width: "80px", padding: "0 8px", display: "flex", alignItems: "center" }}>
                סיום
            </div>
        </div>
    );
};

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
            // Styling overrides for specific task bar
            styles: {
                progressColor: t.status === 'done' ? '#10b981' : '#3b82f6', // Tailwind Emerald : Blue
                progressSelectedColor: '#2563eb',
                backgroundColor: theme.palette.mode === 'dark' ? '#334155' : '#e2e8f0', // Bar background
                backgroundSelectedColor: '#475569',
            },
            project: t.projectId
        };
    });

    return (
        <div id="roadmap-gantt-wrapper" style={{ direction: 'ltr', width: '100%', height: '500px', overflowX: 'auto' }}>
            <Gantt
                tasks={ganttTasks}
                viewMode={ViewMode.Day}
                locale="he"
                rtl={false}
                listCellWidth="155px"
                columnWidth={60}
                barFill={70}
                ganttHeight={500}
                headerHeight={50}
                rowHeight={50}
                TaskListHeader={HebrewTaskListHeader}
                onClick={(task) => {
                    const originalTask = tasks.find(t => t.id === task.id);
                    if (originalTask && onTaskClick) onTaskClick(originalTask);
                }}
            />
        </div>
    );
}
