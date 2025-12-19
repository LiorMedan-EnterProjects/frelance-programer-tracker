"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { Project, TimeLog, getProjects, getTimeLogs, addProject, addTimeLog } from '@/lib/firestore';

interface DataContextType {
    projects: Project[];
    logs: TimeLog[];
    loading: boolean;
    refreshData: () => Promise<void>;
    createNewProject: (project: Omit<Project, 'id' | 'createdAt' | 'userId'>) => Promise<void>;
    createNewTimeLog: (log: Omit<TimeLog, 'id' | 'createdAt' | 'userId'>) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [projects, setProjects] = useState<Project[]>([]);
    const [logs, setLogs] = useState<TimeLog[]>([]);
    const [loading, setLoading] = useState(true);

    const refreshData = async () => {
        if (!user) {
            console.log("refreshData: No user, skipping.");
            return;
        }
        console.log("refreshData: Fetching for user:", user.uid);
        try {
            const [projectsData, logsData] = await Promise.all([
                getProjects(user.uid),
                getTimeLogs(user.uid)
            ]);
            setProjects(projectsData);
            setLogs(logsData);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            refreshData();
        } else {
            setProjects([]);
            setLogs([]);
            setLoading(false);
        }
    }, [user]);

    const createNewProject = async (projectData: Omit<Project, 'id' | 'createdAt' | 'userId'>) => {
        if (!user) return;

        // Optimistic Update
        const tempId = `temp-${Date.now()}`;
        const optimisticProject: Project = {
            ...projectData,
            userId: user.uid,
            id: tempId,
            createdAt: { toDate: () => new Date() } as any
        };

        setProjects(prev => [optimisticProject, ...prev]);

        try {
            console.log("createNewProject: Calling addProject..."); // DEBUG
            const newProjectData: Project = {
                ...projectData,
                userId: user.uid
            };
            const newId = await addProject(newProjectData);
            console.log("createNewProject: addProject success, newId:", newId); // DEBUG

            // Silent refresh to get real ID
            console.log("createNewProject: Refreshing data..."); // DEBUG
            await refreshData();
            console.log("createNewProject: Refresh complete."); // DEBUG
        } catch (error) {
            console.error("Error creating project:", error);
            // Rollback
            setProjects(prev => prev.filter(p => p.id !== tempId));
            throw error;
        }
    };

    const createNewTimeLog = async (logData: Omit<TimeLog, 'id' | 'createdAt' | 'userId'>) => {
        if (!user) return;

        // Optimistic Update can be added here if needed, 
        // but for now we focus on Projects as requested.
        try {
            const newLog: TimeLog = {
                ...logData,
                userId: user.uid
            };
            await addTimeLog(newLog);
            await refreshData();
        } catch (error) {
            console.error("Error creating time log:", error);
            throw error;
        }
    };

    return (
        <DataContext.Provider value={{ projects, logs, loading, refreshData, createNewProject, createNewTimeLog }}>
            {children}
        </DataContext.Provider>
    );
}

export function useData() {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
}
