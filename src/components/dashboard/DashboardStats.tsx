"use client";

import { Grid, Paper, Typography, Box } from '@mui/material';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { Project, TimeLog } from '@/lib/firestore';

interface DashboardStatsProps {
    projects: Project[];
    logs: TimeLog[];
}

export default function DashboardStats({ projects, logs }: DashboardStatsProps) {
    const totalHours = logs.reduce((acc, log) => acc + log.duration, 0) / 3600;

    const totalEarnings = logs.reduce((acc, log) => {
        const project = projects.find(p => p.id === log.projectId);
        const rate = project?.hourlyRate || 0;
        return acc + (log.duration / 3600) * rate;
    }, 0);

    const activeProjects = projects.filter(p => p.status === 'active').length;

    const StatCard = ({ title, value, icon, color }: any) => (
        <Paper elevation={2} sx={{ p: 3, display: 'flex', alignItems: 'center', height: '100%' }}>
            <Box sx={{
                p: 1.5,
                borderRadius: 2,
                bgcolor: `${color}.light`,
                color: `${color}.main`,
                ml: 2, // RTL: margin left instead of right
                display: 'flex'
            }}>
                {icon}
            </Box>
            <Box>
                <Typography variant="body2" color="text.secondary">{title}</Typography>
                <Typography variant="h5" fontWeight="bold">{value}</Typography>
            </Box>
        </Paper>
    );

    return (
        <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, sm: 4 }}>
                <StatCard
                    title="סה״כ רווחים"
                    value={`₪${totalEarnings.toFixed(2)}`}
                    icon={<AttachMoneyIcon fontSize="large" />}
                    color="success"
                />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
                <StatCard
                    title="סה״כ שעות"
                    value={`${totalHours.toFixed(1)} ש'`}
                    icon={<AccessTimeIcon fontSize="large" />}
                    color="primary"
                />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
                <StatCard
                    title="פרויקטים פעילים"
                    value={activeProjects}
                    icon={<AssignmentIcon fontSize="large" />}
                    color="warning"
                />
            </Grid>
        </Grid>
    );
}
