"use client";

import * as React from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import ProfileBanner from "@/components/ProfileBanner";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import { sendEmailVerification } from "firebase/auth";
import { useData } from "@/context/DataContext";
import DashboardStats from "@/components/dashboard/DashboardStats";
import TimeLogList from "@/components/timer/TimeLogList";
import HoursByProjectChart from "@/components/dashboard/HoursByProjectChart";
import WeeklyActivityChart from "@/components/dashboard/WeeklyActivityChart";
import { prepareProjectData, prepareWeeklyActivity } from "@/lib/chartUtils";
import { Grid } from "@mui/material";

export default function DashboardPage() {
    const { user, loading } = useAuth();
    const { projects, logs } = useData();

    // Filter out logs that belong to deleted projects
    const activeLogs = React.useMemo(() => {
        return logs.filter(log => projects.some(p => p.id === log.projectId));
    }, [logs, projects]);

    const router = useRouter();
    const [verificationSent, setVerificationSent] = React.useState(false);

    React.useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    const handleResendVerification = async () => {
        if (user) {
            try {
                await sendEmailVerification(user);
                setVerificationSent(true);
            } catch (error) {
                console.error("Error sending verification email", error);
            }
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!user) {
        return null; // Will redirect
    }

    return (
        <Container maxWidth="md">
            <Box sx={{ my: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'right' }}>
                    לוח בקרה
                </Typography>

                {!user.emailVerified && (
                    <Alert
                        severity="warning"
                        sx={{ mb: 2 }}
                        action={
                            !verificationSent && (
                                <Button color="inherit" size="small" onClick={handleResendVerification}>
                                    שלח שוב
                                </Button>
                            )
                        }
                    >
                        {verificationSent
                            ? "מייל אימות נשלח! נא לבדוק את תיבת הדואר הנכנס."
                            : "האימייל שלך לא מאומת. נא לאמת את המייל כדי לקבל גישה לכל הפיצ'רים."}
                    </Alert>
                )}

                <ProfileBanner />

                <Box sx={{ mt: 4 }}>
                    <DashboardStats projects={projects} logs={activeLogs} />

                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <WeeklyActivityChart data={React.useMemo(() => prepareWeeklyActivity(activeLogs), [activeLogs])} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <HoursByProjectChart data={React.useMemo(() => prepareProjectData(projects, activeLogs), [projects, activeLogs])} />
                        </Grid>
                    </Grid>

                    <Typography variant="h5" gutterBottom sx={{ mt: 4, textAlign: 'right' }}>
                        פעילות אחרונה
                    </Typography>
                    <TimeLogList logs={activeLogs.slice(0, 5)} projects={projects} />
                </Box>
            </Box>
        </Container>
    );
}
