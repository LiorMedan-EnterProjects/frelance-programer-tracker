"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Link from "@mui/material/Link";

export default function Footer() {
    return (
        <Box component="footer" sx={{ py: 6, bgcolor: 'background.paper', borderTop: 1, borderColor: 'divider' }}>
            <Container maxWidth="lg">
                <Typography variant="h6" align="center" gutterBottom>
                    Freelance Tracker
                </Typography>
                <Typography variant="subtitle1" align="center" color="text.secondary" component="p">
                    Build better software, manage your time, and get paid.
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
                    {"Copyright © "}
                    <Link color="inherit" href="https://example.com/">
                        Freelance Tracker
                    </Link>{" "}
                    {new Date().getFullYear()}
                    {"."}
                </Typography>
            </Container>
        </Box>
    );
}
