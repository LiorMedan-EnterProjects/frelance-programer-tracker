"use client";

import React, { createContext, useContext, useState, useRef, useEffect } from "react";
import { Project, addTimeLog, Task, getProjectTasks } from "@/backend/firestore";
import { Timestamp } from "firebase/firestore";
import { useData } from "./DataContext";
import { useAuth } from "./AuthContext";

interface TimerContextType {
    isRunning: boolean;
    elapsedTime: number;
    selectedProject: string;
    selectedTaskId: string;
    description: string;

    // Actions
    startTimer: () => void;
    stopTimer: () => Promise<void>;
    setSelectedProject: (id: string) => void;
    setSelectedTaskId: (id: string) => void;
    setDescription: (desc: string) => void;

    // Data
    projectTasks: Task[];
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export function TimerProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const userId = user?.uid;
    const { logs, refreshData } = useData(); // We need refreshData to update global state after log

    // State
    const [selectedProject, _setSelectedProject] = useState('');
    const [selectedTaskId, setSelectedTaskId] = useState('');
    const [description, setDescription] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [startTime, setStartTime] = useState<Date | null>(null);
    const [projectTasks, setProjectTasks] = useState<Task[]>([]);

    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Fetch tasks when project changes
    useEffect(() => {
        const fetchTasks = async () => {
            if (userId && selectedProject) {
                const tasks = await getProjectTasks(userId, selectedProject);
                setProjectTasks(tasks);
            } else {
                setProjectTasks([]);
            }
        };
        fetchTasks();
    }, [selectedProject, userId]);

    // Timer Interval Logic
    useEffect(() => {
        if (isRunning && startTime) {
            intervalRef.current = setInterval(() => {
                const now = new Date();
                const seconds = Math.floor((now.getTime() - startTime.getTime()) / 1000);
                setElapsedTime(seconds);
            }, 1000);
        } else {
            if (intervalRef.current) clearInterval(intervalRef.current);
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isRunning, startTime]);


    const startTimer = () => {
        if (!selectedProject) {
            alert("נא לבחור פרויקט תחילה");
            return;
        }
        setStartTime(new Date());
        setIsRunning(true);
    };

    const stopTimer = async () => {
        if (!startTime) return;
        setIsRunning(false);
        const endTime = new Date();
        const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

        try {
            // Find task name if exists
            const task = projectTasks.find(t => t.id === selectedTaskId);

            if (userId) {
                await addTimeLog({
                    userId: userId,
                    projectId: selectedProject,
                    taskId: selectedTaskId || undefined,
                    taskName: task ? task.name : undefined,
                    startTime: Timestamp.fromDate(startTime),
                    endTime: Timestamp.fromDate(endTime),
                    duration,
                    description
                });

                // Reset
                setElapsedTime(0);
                setStartTime(null);
                setDescription('');
                // Refresh logs
                await refreshData();
            }
        } catch (error) {
            console.error("Error saving timer log:", error);
        }
    };

    const setSelectedProject = (id: string) => {
        _setSelectedProject(id);
        setSelectedTaskId(''); // Reset task on project change
    };

    return (
        <TimerContext.Provider value={{
            isRunning,
            elapsedTime,
            selectedProject,
            selectedTaskId,
            description,
            startTimer,
            stopTimer,
            setSelectedProject,
            setSelectedTaskId,
            setDescription,
            projectTasks
        }}>
            {children}
        </TimerContext.Provider>
    );
}

export const useTimer = () => {
    const context = useContext(TimerContext);
    if (context === undefined) {
        throw new Error("useTimer must be used within a TimerProvider");
    }
    return context;
};
