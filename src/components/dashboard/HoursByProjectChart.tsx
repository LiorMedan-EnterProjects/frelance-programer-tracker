"use client";

import React from 'react';
import { Paper, Typography, Box, useTheme } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ProjectChartData } from '@/lib/chartUtils';

interface Props {
    data: ProjectChartData[];
}

export default function HoursByProjectChart({ data }: Props) {
    const theme = useTheme();

    if (data.length === 0) {
        return (
            <Paper sx={{ p: 3, height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="text.secondary">אין מספיק נתונים להצגה</Typography>
            </Paper>
        );
    }

    return (
        <Paper sx={{ p: 3, height: 350, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>
                התפלגות שעות לפי פרויקט
            </Typography>
            <Box sx={{ flexGrow: 1, minHeight: 0, width: '100%' }}>
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
            </Box>
        </Paper>
    );
}
