"use client";

import React from 'react';
import { Paper, Typography, useTheme, Box } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { WeeklyChartData } from '@/frontend/utils/chartUtils';

interface Props {
    data: WeeklyChartData[];
}

export default function WeeklyActivityChart({ data }: Props) {
    const theme = useTheme();

    // Remove early return to always show the grid
    // if (data.every(d => d.hours === 0)) { ... }

    return (
        <Paper sx={{ p: 3, height: 350, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom sx={{ textAlign: 'right' }}>
                פעילות ב-7 הימים האחרונים
            </Typography>
            <Box sx={{ flexGrow: 1, minHeight: 0, width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                        <XAxis
                            dataKey="day"
                            tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                            orientation="right" // RTL visual preference
                        />
                        <Tooltip
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{ backgroundColor: theme.palette.background.paper, borderRadius: 8, direction: 'rtl' }}
                            labelStyle={{ color: theme.palette.text.secondary }}
                            formatter={(value: any) => [`${value} שעות`, 'משך עבודה']}
                            labelFormatter={(label, payload) => {
                                if (payload && payload.length > 0) {
                                    return (payload[0].payload as WeeklyChartData).date;
                                }
                                return label;
                            }}
                        />
                        <Bar
                            dataKey="hours"
                            fill={theme.palette.primary.main}
                            radius={[4, 4, 0, 0]}
                            barSize={40}
                            activeBar={{ fill: theme.palette.primary.light }}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </Box>
        </Paper>
    );
}
