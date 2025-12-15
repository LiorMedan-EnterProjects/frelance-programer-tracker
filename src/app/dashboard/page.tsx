"use client";

import * as React from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import ProfileBanner from "@/components/ProfileBanner";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import CircularProgress from "@mui/material/CircularProgress";

export default function DashboardPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    React.useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

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
                <ProfileBanner />
                <Typography variant="body1">
                    Welcome to your protected dashboard. Only authenticated users can see this page.
                </Typography>
            </Box>
        </Container>
    );
}
