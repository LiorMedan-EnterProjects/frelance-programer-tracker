"use client";

import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import GoogleIcon from "@mui/icons-material/Google";
import GitHubIcon from "@mui/icons-material/GitHub";
import Divider from "@mui/material/Divider";

export default function LoginPage() {
    const { signInWithGoogle, signInWithGithub, user } = useAuth();
    const router = useRouter();
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (user) {
            router.push("/dashboard");
        }
    }, [user, router]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        const data = new FormData(event.currentTarget);
        const email = data.get("email") as string;
        const password = data.get("password") as string;

        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleSocialLogin = async (provider: 'google' | 'github') => {
        setError(null);
        try {
            if (provider === 'google') {
                await signInWithGoogle();
            } else {
                await signInWithGithub();
            }
            router.push("/dashboard");
        } catch (err: any) {
            console.error("Social login error:", err);
            if (err.code === 'auth/account-exists-with-different-credential') {
                setError("חשבון עם אימייל זה כבר קיים. אנא התחבר דרך הספק שבו השתמשת לראשונה (למשל Google או אימייל).");
            } else if (err.code === 'auth/popup-closed-by-user') {
                setError("חלון ההתחברות נסגר לפני סיום התהליך.");
            } else {
                setError("ההתחברות נכשלה. אנא נסה שוב.");
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
                    <LockOutlinedIcon />
                </Avatar>
                <Typography component="h1" variant="h5">
                    התחברות
                </Typography>
                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
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
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="סיסמה"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        sx={{ textAlign: 'right', '& .MuiInputLabel-root': { right: 28, left: 'auto', transformOrigin: 'top right' } }}
                    />
                    {error && (
                        <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                            {error}
                        </Typography>
                    )}
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        התחבר
                    </Button>

                    <Divider sx={{ my: 2 }}>או</Divider>

                    <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<GoogleIcon />}
                        onClick={() => handleSocialLogin('google')}
                        sx={{ mb: 1 }}
                    >
                        התחבר עם Google
                    </Button>
                    <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<GitHubIcon />}
                        onClick={() => handleSocialLogin('github')}
                        sx={{ mb: 2 }}
                    >
                        התחבר עם GitHub
                    </Button>

                    <Grid container>
                        <Grid size="grow">
                            <Link href="/forgot-password" variant="body2">
                                שכחת סיסמה?
                            </Link>
                        </Grid>
                        <Grid>
                            <Link href="/signup" variant="body2">
                                {"אין לך חשבון? הירשם"}
                            </Link>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </Container>
    );
}
