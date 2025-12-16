"use client";

import { useEffect, useState } from 'react';
import { Container, Typography, Box, Button, Dialog, DialogTitle, DialogContent } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useAuth } from '@/context/AuthContext';
import { getProjects, addProject, deleteProject, Project } from '@/lib/firestore';
import ProjectList from '@/components/projects/ProjectList';
import ProjectForm from '@/components/projects/ProjectForm';
import { useRouter } from 'next/navigation';

export default function ProjectsPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [projects, setProjects] = useState<Project[]>([]);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (!user) {
            router.push('/');
            return;
        }

        const fetchProjects = async () => {
            try {
                const data = await getProjects(user.uid);
                setProjects(data);
            } catch (error) {
                console.error("Error fetching projects:", error);
            }
        };

        fetchProjects();
    }, [user, router]);

    const handleCreateProject = async (projectData: Omit<Project, 'id' | 'createdAt' | 'userId'>) => {
        if (!user) return;
        try {
            const newProject: Project = {
                ...projectData,
                userId: user.uid,
            };
            await addProject(newProject);
            setOpen(false);
            // Refresh list
            const data = await getProjects(user.uid);
            setProjects(data);
        } catch (error) {
            console.error("Error creating project:", error);
        }
    };

    const handleDeleteProject = async (id: string) => {
        if (!confirm("Are you sure you want to delete this project?")) return;
        try {
            await deleteProject(id);
            setProjects(projects.filter(p => p.id !== id));
        } catch (error) {
            console.error("Error deleting project:", error);
        }
    };

    if (!user) return null;

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" component="h1">
                    Projects
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setOpen(true)}
                >
                    New Project
                </Button>
            </Box>

            <ProjectList projects={projects} onDelete={handleDeleteProject} />

            <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>Create New Project</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1 }}>
                        <ProjectForm onSubmit={handleCreateProject} />
                    </Box>
                </DialogContent>
            </Dialog>
        </Container>
    );
}
