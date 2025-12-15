"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import { useAuth } from "@/context/AuthContext";

export default function ProfileBanner() {
    const { user } = useAuth();

    if (!user) {
        return null;
    }

    return (
        <Card sx={{ minWidth: 275, mb: 4, mt: 4, display: 'flex', alignItems: 'center', p: 2 }}>
            <Avatar
                alt={user.displayName || "User"}
                src={user.photoURL || undefined}
                sx={{ width: 80, height: 80, mr: 3 }}
            />
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flex: '1 0 auto' }}>
                    <Typography component="div" variant="h5">
                        {user.displayName || "Anonymous User"}
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary" component="div">
                        {user.email}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        UID: {user.uid}
                    </Typography>
                </CardContent>
            </Box>
        </Card>
    );
}
