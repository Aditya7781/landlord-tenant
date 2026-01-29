'use client';

import React from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Avatar,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Alert,
} from '@mui/material';
import {
    MeetingRoom as RoomIcon,
    Phone as PhoneIcon,
    Assignment as AssignmentIcon,
    VerifiedUser as VerifiedIcon,
    Notifications as NotificationIcon,
} from '@mui/icons-material';
import { DashboardSkeleton } from '@/components/shared/SkeletonLoader';
import { motion } from 'framer-motion';

// --- Types from dev/my?query=dashboard ---
interface DashboardAssignment {
    roomNo: string;
    bedIndex: number;
    bedName: string;
    amount: number;
    dueDate: string;
    assignedAt: string;
    currentAmount: number;
    currentDueDate: string;
}

interface DashboardResponse {
    email: string;
    basicInfo?: { name?: string; phone?: string };
    assignments: DashboardAssignment[];
    summary: { totalAssignments: number; rooms: number };
}

const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '—';
    try {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    } catch {
        return '—';
    }
};

const formatAmount = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

export default function UserDashboard() {
    const [data, setData] = React.useState<DashboardResponse | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/my?query=dashboard', { credentials: 'include' });
                const json = await res.json();

                if (!res.ok) {
                    throw new Error(json.message || 'Failed to load dashboard');
                }
                setData(json);
            } catch (e) {
                setError(e instanceof Error ? e.message : 'Something went wrong');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <DashboardSkeleton />;
    if (error) {
        return (
            <Box>
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            </Box>
        );
    }
    if (!data) return null;

    const { email, basicInfo = {}, assignments = [], summary = { totalAssignments: 0, rooms: 0 } } = data;
    const name = basicInfo?.name || email.split('@')[0] || 'Guest';
    const phone = basicInfo?.phone || 'N/A';
    const status = assignments.length > 0 ? 'Active' : 'Pending';

    const infoCards = [
        { label: 'Total Assignments', value: String(summary.totalAssignments), icon: <AssignmentIcon color="primary" /> },
        { label: 'Rooms', value: String(summary.rooms), icon: <RoomIcon color="secondary" /> },
        { label: 'Phone', value: phone, icon: <PhoneIcon color="success" /> },
        { label: 'Status', value: status, icon: <VerifiedIcon color="info" /> },
    ];

    return (
        <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 5 }}>
                <Avatar
                    sx={{
                        width: 80,
                        height: 80,
                        bgcolor: 'primary.main',
                        fontSize: '2rem',
                        boxShadow: 3,
                    }}
                >
                    {name[0]}
                </Avatar>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800 }}>
                        Welcome, {name}!
                    </Typography>
                    <Typography color="text.secondary">{email}</Typography>
                </Box>
            </Box>

            <Grid container spacing={3}>
                {infoCards.map((card, index) => (
                    <Grid size={{ xs: 12, sm: 6, md: 3 }} key={card.label}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Paper sx={{ p: 3, borderRadius: 4, textAlign: 'center', height: '100%' }}>
                                <Box sx={{ mb: 1.5, display: 'inline-flex', p: 1, borderRadius: 2, bgcolor: 'action.hover' }}>
                                    {card.icon}
                                </Box>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    {card.label}
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                    {card.label === 'Status' ? (
                                        <Chip label={card.value} color="success" size="small" sx={{ fontWeight: 600 }} />
                                    ) : (
                                        card.value
                                    )}
                                </Typography>
                            </Paper>
                        </motion.div>
                    </Grid>
                ))}

                <Grid size={{ xs: 12, md: 8 }}>
                    <Paper sx={{ p: 4, borderRadius: 4, height: '100%' }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                            My Assignments
                        </Typography>
                        {assignments.length === 0 ? (
                            <Typography color="text.secondary">
                                No assignments yet. Your room and bed allocations will appear here.
                            </Typography>
                        ) : (
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: 'action.hover' }}>
                                            <TableCell sx={{ fontWeight: 700 }}>Room</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Bed</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Amount</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Due Date</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Current Due</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Assigned At</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {assignments.map((a, idx) => (
                                            <TableRow key={`${a.roomNo}-${a.bedName}-${idx}`} hover>
                                                <TableCell sx={{ fontWeight: 600 }}>{a.roomNo}</TableCell>
                                                <TableCell>{a.bedName}</TableCell>
                                                <TableCell sx={{ fontWeight: 600 }}>{formatAmount(a.currentAmount)}</TableCell>
                                                <TableCell>{formatDate(a.dueDate)}</TableCell>
                                                <TableCell>{formatDate(a.currentDueDate)}</TableCell>
                                                <TableCell>{formatDate(a.assignedAt)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper sx={{ p: 4, borderRadius: 4, height: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                            <NotificationIcon color="primary" />
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                Latest Updates
                            </Typography>
                        </Box>
                        <Typography color="text.secondary">
                            No updates at the moment. Notifications will appear here when available.
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}
