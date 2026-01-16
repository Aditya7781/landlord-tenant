'use client';

import React from 'react';
import { Box, Skeleton, Grid, Paper } from '@mui/material';

export const CardSkeleton = () => (
    <Paper sx={{ p: 2, borderRadius: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Skeleton variant="circular" width={40} height={40} />
            <Box sx={{ flexGrow: 1 }}>
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="text" width="40%" />
            </Box>
        </Box>
        <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2 }} />
    </Paper>
);

export const TableSkeleton = ({ rows = 5 }: { rows?: number }) => (
    <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Skeleton variant="text" width={200} height={40} />
            <Skeleton variant="rectangular" width={150} height={40} />
        </Box>
        <Paper sx={{ p: 2, borderRadius: 4 }}>
            {[...Array(rows)].map((_, i) => (
                <Box key={i} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                    <Skeleton variant="circular" width={32} height={32} />
                    <Skeleton variant="text" sx={{ flexGrow: 1 }} />
                    <Skeleton variant="text" width={100} />
                    <Skeleton variant="text" width={50} />
                </Box>
            ))}
        </Paper>
    </Box>
);

export const DashboardSkeleton = () => (
    <Box>
        <Skeleton variant="text" width={300} height={60} sx={{ mb: 4 }} />
        <Grid container spacing={3}>
            {[...Array(4)].map((_, i) => (
                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
                    <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 4 }} />
                </Grid>
            ))}
        </Grid>
        <Grid container spacing={3} sx={{ mt: 3 }}>
            <Grid size={{ xs: 12, md: 8 }}>
                <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 4 }} />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
                <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 4 }} />
            </Grid>
        </Grid>
    </Box>
);
