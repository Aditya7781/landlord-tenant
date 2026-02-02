'use client';

import React from 'react';
import {
    Paper,
    Typography,
    Box,
    Card,
    CardContent,
    Grid,
    Divider,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Avatar,
    Button,
    Chip,
    Alert,
    CircularProgress
} from '@mui/material';
import {
    People as PeopleIcon,
    Hotel as HotelIcon,
    Payments as PaymentIcon,
    Notifications as NotificationIcon,
    TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { DashboardSkeleton } from '@/components/shared/SkeletonLoader';

interface User {
    id?: string;
    name?: string;
    email?: string;
    emailAddress?: string;
    firstName?: string;
    lastName?: string;
    status?: string;
    role?: string;
    createdAt?: string;
    allocation?: {
        roomNo: string;
        bedNo: string;
    };
}

interface Room {
    id?: string;
    roomNo?: string;
    bedName?: string;
    status?: string;
    occupied?: boolean;
}

interface PaymentStats {
    totalPayments: number;
    paidCount: number;
    dueCount: number;
    totalRevenue: number;
    totalDues: number;
}

interface DashboardData {
    users: User[];
    rooms: Room[];
    paymentStats: PaymentStats;
}

const getCookieValue = (name: string): string | null => {
    if (typeof document === "undefined") return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
    return null;
};

export default function AdminDashboard() {
    const [data, setData] = React.useState<DashboardData | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const token = getCookieValue("session_token");
                if (!token) {
                    setError("No authentication token found");
                    return;
                }

                const [usersResponse, roomsResponse, paymentsResponse] = await Promise.all([
                    fetch("/api/users", {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    fetch("/api/rooms", {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    fetch("/api/admin/payments", {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                ]);

                const [usersData, roomsData, paymentsData] = await Promise.all([
                    usersResponse.json(),
                    roomsResponse.json(),
                    paymentsResponse.json()
                ]);

                if (!usersResponse.ok || !roomsResponse.ok || !paymentsResponse.ok) {
                    throw new Error("Failed to fetch dashboard data");
                }

                setData({
                    users: usersData.users || usersData.data || [],
                    rooms: roomsData.rooms || roomsData.data || [],
                    paymentStats: paymentsData.stats || { dueCount: 0, paidCount: 0, totalPayments: 0, totalRevenue: 0, totalDues: 0 }
                });
            } catch (error) {
                console.error("Dashboard fetch error:", error);
                setError(error instanceof Error ? error.message : "Failed to load dashboard data");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return <DashboardSkeleton />;
    }

    if (error) {
        return (
            <Box>
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            </Box>
        );
    }

    if (!data) {
        return (
            <Box>
                <Alert severity="warning">
                    No data available
                </Alert>
            </Box>
        );
    }

    const stats = [
        { title: 'Total Residents', value: data.users.length, icon: <PeopleIcon color="primary" />, color: '#3b82f6' },
        { title: 'Active Rooms', value: data.rooms.length, icon: <HotelIcon color="secondary" />, color: '#8b5cf6' },
        { title: 'Pending Dues', value: data.paymentStats.dueCount, icon: <PaymentIcon color="warning" />, color: '#f59e0b' },
        { title: 'New Applications', value: data.users.filter(u => u.status === 'Pending' || u.status === 'Applied').length, icon: <TrendingUpIcon color="success" />, color: '#10b981' },
    ];

    return (
        <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, color: 'text.primary' }}>
                Dashboard Overview
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Welcome back, Admin. Here&apos;s what&apos;s happening today.
            </Typography>

            <Grid container spacing={3} sx={{ mt: 1 }}>
                {stats.map((stat, index) => (
                    <Grid size={{ xs: 12, sm: 6, md: 3 }} key={stat.title}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                            <Card sx={{ height: '100%', borderRadius: 4, transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
                                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: `${stat.color}15` }}>
                                        {stat.icon}
                                    </Box>
                                    <Box>
                                        <Typography color="text.secondary" variant="body2" sx={{ fontWeight: 500 }}>
                                            {stat.title}
                                        </Typography>
                                        <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                            {stat.value}
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </Grid>
                ))}
            </Grid>

            <Grid container spacing={3} sx={{ mt: 3 }}>
                <Grid size={{ xs: 12, md: 8 }}>
                    <Paper sx={{ p: 4, borderRadius: 4, height: '100%' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>Recent Activity</Typography>
                            <Button size="small">View All</Button>
                        </Box>
                        <List>
                            {data.users
                                .filter(user => user.allocation && user.allocation.roomNo) // Only users with assignments
                                .slice(0, 5) // Top 5 users with assignments
                                .map((user, i) => (
                                <React.Fragment key={user.id || user.emailAddress || i}>
                                    <ListItem sx={{ px: 0 }}>
                                        <ListItemIcon>
                                            <Avatar sx={{ bgcolor: 'primary.light', width: 40, height: 40 }}>
                                                {user.firstName && user.lastName ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase() : (user.emailAddress || 'U')[0].toUpperCase()}
                                            </Avatar>
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.emailAddress || 'Unknown User'}
                                            secondary={`was assigned Room R-${user.allocation?.roomNo || '?'}, Bed B-${user.allocation?.bedNo || '?'}`}
                                            primaryTypographyProps={{ fontWeight: 600 }}
                                        />
                                        <Chip 
                                            label={user.status || 'Unknown'} 
                                            size="small" 
                                            color={user.status === 'active' || user.status === 'Active' ? 'success' : user.status === 'Pending' || user.status === 'pending' ? 'warning' : 'default'} 
                                            sx={{ borderRadius: 1.5 }} 
                                        />
                                    </ListItem>
                                    {i < Math.min(4, data.users.filter(u => u.allocation && u.allocation.roomNo).length - 1) && <Divider component="li" />}
                                </React.Fragment>
                            ))}
                            {data.users.filter(user => user.allocation && user.allocation.roomNo).length === 0 && (
                                <ListItem sx={{ px: 0 }}>
                                    <ListItemText
                                        primary="No recent assignments"
                                        secondary="Room and bed assignments will appear here once available"
                                        primaryTypographyProps={{ textAlign: 'center', color: 'text.secondary' }}
                                    />
                                </ListItem>
                            )}
                        </List>
                    </Paper>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper sx={{ p: 4, borderRadius: 4, height: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                            <NotificationIcon color="primary" />
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>Notifications</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Typography color="text.secondary">
                                No new notifications at the moment.
                            </Typography>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}
