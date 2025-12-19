"use client";

import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Link from "@mui/material/Link";
import Box from "@mui/material/Box";
import LockResetIcon from "@mui/icons-material/LockReset";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Grid from "@mui/material/Grid";

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [error, setError] = React.useState<string | null>(null);
    const [message, setMessage] = React.useState<string | null>(null);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setMessage(null);
        const data = new FormData(event.currentTarget);
        const email = data.get("email") as string;

        if (!email) {
            setError("אנא הזן את כתובת האימייל שלך.");
            return;
        }

        try {
            await sendPasswordResetEmail(auth, email);
            setMessage("קישור לאיפוס סיסמה נשלח! בדוק את תיבת הדואר הנכנס שלך.");
        } catch (err: any) {
            console.error("Reset password error:", err);
            if (err.code === 'auth/user-not-found') {
                setError("לא נמצא חשבון עם כתובת אימייל זו.");
            } else {
                setError("שליחת הקישור נכשלה. אנא נסה שוב.");
            }
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <Box
                sx={{
                    marginTop: 8,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                }}
            >
                <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
                    <LockResetIcon />
                </Avatar>
                <Typography component="h1" variant="h5">
                    איפוס סיסמה
                </Typography>
                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
                    <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
                        הזן את כתובת האימייל שלך ונשלח לך קישור לאיפוס הסיסמה.
                    </Typography>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="כתובת אימייל"
                        name="email"
                        autoComplete="email"
                        autoFocus
                        sx={{ textAlign: 'right', '& .MuiInputLabel-root': { right: 28, left: 'auto', transformOrigin: 'top right' } }}
                    />
                    {error && (
                        <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                            {error}
                        </Typography>
                    )}
                    {message && (
                        <Typography color="success.main" variant="body2" sx={{ mt: 1 }}>
                            {message}
                        </Typography>
                    )}
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        שלח קישור לאיפוס
                    </Button>
                    <Grid container justifyContent="flex-end">
                        <Grid>
                            <Link href="/login" variant="body2">
                                חזרה להתחברות
                            </Link>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </Container>
    );
}
