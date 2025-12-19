"use client";

import React from 'react';
import { Paper, Typography, useTheme, Box } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface StatusData {
    name: string;
    value: number;
    color: string;
}

interface Props {
    data: StatusData[];
    title?: string;
}

export default function StatusBarChart({ data, title }: Props) {
    const theme = useTheme();

    return (
        <Paper sx={{ p: 3, height: 350, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom sx={{ textAlign: 'right' }}>
                {title || 'סטטוס'}
            </Typography>
            <Box sx={{ flexGrow: 1, minHeight: 0, width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
                {data.every(d => d.value === 0) ? (
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        opacity: 0.5
                    }}>
                        <Typography variant="body2" color="text.secondary">אין נתונים להצגה</Typography>
                    </Box>
                ) : (
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
                                dataKey="name"
                                tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                                axisLine={false}
                                tickLine={false}
                                orientation="right" // RTL
                            />
                            <Tooltip
                                cursor={{ fill: 'transparent' }}
                                contentStyle={{ backgroundColor: theme.palette.background.paper, borderRadius: 8, direction: 'rtl' }}
                                labelStyle={{ color: theme.palette.text.secondary }}
                            />
                            <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40}>
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </Box>
        </Paper>
    );
}
