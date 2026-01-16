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
    Button, // Added Button
    Chip // Added Chip
} from '@mui/material';
import {
    People as PeopleIcon,
    Hotel as HotelIcon,
    Payments as PaymentIcon, // Changed Payment to Payments
    Notifications as NotificationIcon, // Added NotificationIcon
    TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { mockApi, User, Room, Payment, AppNotification } from '@/services/mockApi'; // Added mockApi imports
import { DashboardSkeleton } from '@/components/shared/SkeletonLoader'; // Added DashboardSkeleton

export default function AdminDashboard() {
    const [data, setData] = React.useState<{
        users: User[];
        rooms: Room[];
        payments: Payment[];
        notifications: AppNotification[];
    } | null>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const [users, rooms, payments, notifications] = await Promise.all([
                    mockApi.getUsers(),
                    mockApi.getRooms(),
                    mockApi.getPayments(),
                    mockApi.getNotifications(),
                ]);
                setData({ users, rooms, payments, notifications });
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading || !data) {
        return <DashboardSkeleton />;
    }

    const stats = [
        { title: 'Total Residents', value: data.users.length, icon: <PeopleIcon color="primary" />, color: '#3b82f6' },
        { title: 'Active Rooms', value: data.rooms.length, icon: <HotelIcon color="secondary" />, color: '#8b5cf6' },
        { title: 'Pending Dues', value: data.payments.filter(p => p.status === 'Pending').length, icon: <PaymentIcon color="warning" />, color: '#f59e0b' },
        { title: 'New Applications', value: 3, icon: <TrendingUpIcon color="success" />, color: '#10b981' },
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
                            {data.users.slice(0, 5).map((user, i) => (
                                <React.Fragment key={user.id}>
                                    <ListItem sx={{ px: 0 }}>
                                        <ListItemIcon>
                                            <Avatar sx={{ bgcolor: 'primary.light', width: 40, height: 40 }}>{user.name[0]}</Avatar>
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={user.name}
                                            secondary={`${user.status === 'Active' ? 'Checked in' : 'Applied'} - ${new Date().toLocaleDateString()}`}
                                            primaryTypographyProps={{ fontWeight: 600 }}
                                        />
                                        <Chip label={user.status} size="small" color={user.status === 'Active' ? 'success' : 'warning'} sx={{ borderRadius: 1.5 }} />
                                    </ListItem>
                                    {i < 4 && <Divider component="li" />}
                                </React.Fragment>
                            ))}
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
                            {data.notifications.map((notif) => (
                                <Box key={notif.id} sx={{ p: 2, borderRadius: 2, bgcolor: 'action.hover' }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{notif.title}</Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>{notif.date}</Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>{notif.message}</Typography>
                                </Box>
                            ))}
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}
