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
import { getProjects, getTimeLogs, Project, TimeLog } from "@/lib/firestore";
import DashboardStats from "@/components/dashboard/DashboardStats";
import TimeLogList from "@/components/timer/TimeLogList";

export default function DashboardPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [verificationSent, setVerificationSent] = React.useState(false);
    const [projects, setProjects] = React.useState<Project[]>([]);
    const [logs, setLogs] = React.useState<TimeLog[]>([]);

    React.useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    React.useEffect(() => {
        const fetchData = async () => {
            if (user) {
                try {
                    const [projectsData, logsData] = await Promise.all([
                        getProjects(user.uid),
                        getTimeLogs(user.uid)
                    ]);
                    setProjects(projectsData);
                    setLogs(logsData);
                } catch (error) {
                    console.error("Error fetching dashboard data:", error);
                }
            }
        };
        fetchData();
    }, [user]);

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
                <Typography variant="h4" component="h1" gutterBottom>
                    Dashboard
                </Typography>

                {!user.emailVerified && (
                    <Alert
                        severity="warning"
                        sx={{ mb: 2 }}
                        action={
                            !verificationSent && (
                                <Button color="inherit" size="small" onClick={handleResendVerification}>
                                    Resend Email
                                </Button>
                            )
                        }
                    >
                        {verificationSent
                            ? "Verification email sent! Please check your inbox."
                            : "Your email is not verified. Please verify your email to access all features."}
                    </Alert>
                )}

                <ProfileBanner />

                <Box sx={{ mt: 4 }}>
                    <DashboardStats projects={projects} logs={logs} />

                    <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
                        Recent Activity
                    </Typography>
                    <TimeLogList logs={logs.slice(0, 5)} projects={projects} />
                </Box>
            </Box>
        </Container>
    );
}
