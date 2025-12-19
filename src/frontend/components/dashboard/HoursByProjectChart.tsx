"use client";

import React from 'react';
import { Paper, Typography, Box, useTheme } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ProjectChartData } from '@/frontend/utils/chartUtils';

interface Props {
    data: ProjectChartData[];
    title?: string;
}

export default function HoursByProjectChart({ data, title }: Props) {
    const theme = useTheme();

    if (data.length === 0) {
        // ... (keep logic)
    }

    return (
        <Paper sx={{ p: 3, height: 350, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom sx={{ textAlign: 'right' }}>
                {title || 'התפלגות נתונים'}
            </Typography>
            <Box sx={{ flexGrow: 1, minHeight: 0, width: '100%', position: 'relative' }}>
                {data.every(d => d.value === 0) ? (
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        opacity: 0.5
                    }}>
                        <Box sx={{
                            width: 160,
                            height: 160,
                            borderRadius: '50%',
                            border: `12px solid ${theme.palette.divider}`,
                            mb: 2
                        }} />
                        <Typography variant="body2" color="text.secondary">אין שעות רשומות</Typography>
                    </Box>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} stroke={theme.palette.background.paper} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value: any) => [`${value} שעות`, '']}
                                contentStyle={{ backgroundColor: theme.palette.background.paper, borderRadius: 8, direction: 'rtl' }}
                                itemStyle={{ color: theme.palette.text.primary }}
                            />
                            <Legend
                                layout="vertical"
                                verticalAlign="middle"
                                align="right"
                                wrapperStyle={{ direction: 'rtl' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                )}
            </Box>
        </Paper>
    );
}
