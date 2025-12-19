"use client";

import { useEffect, useState } from 'react';
import { Container, Typography, Box, Button, Dialog, DialogTitle, DialogContent, Snackbar, Alert } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { deleteProject, Project } from '@/lib/firestore';
import ProjectList from '@/components/projects/ProjectList';
import ProjectForm from '@/components/projects/ProjectForm';
import { useRouter } from 'next/navigation';

export default function ProjectsPage() {
    const { user } = useAuth();
    const { projects, createNewProject, refreshData } = useData();
    const router = useRouter();
    // const [projects, setProjects] = useState<Project[]>([]); // Removed local state
    const [open, setOpen] = useState(false);
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

    const handleCreateProject = async (projectData: Omit<Project, 'id' | 'createdAt' | 'userId'>) => {
        if (!user) return;

        // Optimistic UI: Close dialog immediately
        setOpen(false);
        setSnackbar({ open: true, message: 'הפרויקט נשמר!', severity: 'success' });

        try {
            await createNewProject(projectData);
        } catch (error) {
            console.error("Error creating project:", error);
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
                    onClick={() => setOpen(true)}
                >
                    פרויקט חדש
                </Button>
            </Box>

            <ProjectList projects={projects} onDelete={handleDeleteProject} />

            <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold' }}>יצירת פרויקט חדש</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1 }}>
                        <ProjectForm onSubmit={handleCreateProject} />
                    </Box>
                </DialogContent>
            </Dialog>

            <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
}
