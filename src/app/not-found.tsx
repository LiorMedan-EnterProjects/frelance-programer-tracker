"use client";

import Link from 'next/link';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';

export default function NotFound() {
    return (
        <Container component="main" maxWidth="xs">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    gap: 2
                }}
            >
                <Typography variant="h1" component="h1" fontWeight="bold" color="primary">
                    404
                </Typography>
                <Typography variant="h5" component="h2" gutterBottom>
                    העמוד לא נמצא
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                    מצטערים, אך העמוד שחיפשת אינו קיים או שהוסר.
                </Typography>
                <Button
                    variant="contained"
                    component={Link}
                    href="/dashboard"
                    sx={{ mt: 2 }}
                >
                    חזרה ללוח הבקרה
                </Button>
            </Box>
        </Container>
    );
}
