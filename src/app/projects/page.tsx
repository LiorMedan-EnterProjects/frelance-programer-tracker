"use client";

import { useEffect, useState } from 'react';
import { Container, Typography, Box, Button, Snackbar, Alert } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useAuth } from '@/frontend/context/AuthContext';
import { useData } from '@/frontend/context/DataContext';
import { deleteProject, updateProject, Project } from '@/backend/firestore';
import ProjectList from '@/frontend/components/projects/ProjectList';
import ProjectModal from '@/frontend/components/projects/ProjectModal';
import { useRouter } from 'next/navigation';

export default function ProjectsPage() {
    const { user } = useAuth();
    const { projects, logs, tasks, createNewProject, refreshData } = useData();
    const router = useRouter();

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [projectToEdit, setProjectToEdit] = useState<Project | undefined>(undefined);

    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false,
        message: '',
        severity: 'success',
    });

    useEffect(() => {
        if (!user) {
            router.push('/');
        }
    }, [user, router]);

    const handleCreateClick = () => {
        setProjectToEdit(undefined);
        setIsModalOpen(true);
    };

    const handleEditClick = (project: Project) => {
        setProjectToEdit(project);
        setIsModalOpen(true);
    };

    const handleSaveProject = async (projectData: Partial<Project>) => {
        if (!user) return;

        // Optimistic UI: Close dialog immediately
        setIsModalOpen(false);
        setSnackbar({ open: true, message: 'הפרויקט נשמר!', severity: 'success' });

        try {
            if (projectToEdit && projectToEdit.id) {
                // Update existing
                await updateProject(projectToEdit.id, projectData);
            } else {
                // Create new
                // We need to cast to casting type expected by createNewProject
                // or just call createNewProject which takes Omit<Project, ...>
                await createNewProject(projectData as any);
            }
            await refreshData();
        } catch (error) {
            console.error("Error saving project:", error);
            setSnackbar({ open: true, message: 'שגיאה בשמירה. הנתונים לא נשמרו.', severity: 'error' });
        }
    };

    const handleDeleteProject = async (id: string) => {
        if (!confirm("האם אתה בטוח שברצונך למחוק את הפרויקט?")) return;
        try {
            await deleteProject(id);
            await refreshData(); // Sync global state
            setSnackbar({ open: true, message: 'הפרויקט נמחק.', severity: 'success' });
        } catch (error) {
            console.error("Error deleting project:", error);
            setSnackbar({ open: true, message: 'שגיאה במחיקת הפרויקט.', severity: 'error' });
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    if (!user) return null;

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" component="h1">
                    פרויקטים
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleCreateClick}
                >
                    פרויקט חדש
                </Button>
            </Box>

            <ProjectList
                projects={projects}
                logs={logs}
                tasks={tasks}
                onDelete={handleDeleteProject}
                onEdit={handleEditClick}
            />

            <ProjectModal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveProject}
                project={projectToEdit}
            />

            <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
}
