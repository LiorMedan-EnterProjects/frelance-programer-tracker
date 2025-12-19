"use client";

import React from 'react';
import { Container, Typography, Box, Button, Paper, List, ListItem, ListItemIcon, ListItemText, Alert } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CircularProgress from '@mui/material/CircularProgress';
import { useSystemHealth, TestStatus } from './useSystemHealth';

export default function TestConnectionPage() {
    const { results, runTests, isRunning } = useSystemHealth();

    const getIcon = (status: TestStatus) => {
        switch (status) {
            case 'running': return <CircularProgress size={24} />;
            case 'success': return <CheckCircleIcon color="success" />;
            case 'error': return <ErrorIcon color="error" />;
            default: return <HourglassEmptyIcon color="disabled" />;
        }
    };

    return (
        <Container maxWidth="sm">
            <Box sx={{ my: 4 }}>
                <Typography variant="h4" gutterBottom>
                    בדיקת תקינות מערכת (Health Check)
                </Typography>
                <Typography variant="body1" paragraph color="text.secondary">
                    דף זה מבצע סדרת בדיקות אוטומטיות כדי לוודא שכל רכיבי המערכת (חיבור, מסד נתונים, אינדקסים) פועלים כשורה.
                </Typography>

                <Button
                    variant="contained"
                    size="large"
                    startIcon={<PlayArrowIcon />}
                    onClick={runTests}
                    disabled={isRunning}
                    fullWidth
                    sx={{ mb: 4 }}
                >
                    {isRunning ? 'מריץ בדיקות...' : 'התחל בדיקות'}
                </Button>

                <Paper elevation={2}>
                    <List>
                        {results.map((test) => (
                            <ListItem key={test.id} divider>
                                <ListItemIcon>
                                    {getIcon(test.status)}
                                </ListItemIcon>
                                <ListItemText
                                    primary={test.name}
                                    secondary={test.details}
                                    secondaryTypographyProps={{
                                        color: test.status === 'error' ? 'error' : 'text.secondary'
                                    }}
                                />
                            </ListItem>
                        ))}
                    </List>
                </Paper>

                {results.some(r => r.status === 'error') && (
                    <Alert severity="error" sx={{ mt: 3 }}>
                        נמצאו תקלות במערכת. אנא בדוק את ההודעות למעלה או את הקונסול לפרטים נוספים.
                    </Alert>
                )}

                {results.every(r => r.status === 'success') && (
                    <Alert severity="success" sx={{ mt: 3 }}>
                        כל המערכות תקינות!
                    </Alert>
                )}
            </Box>
        </Container>
    );
}
