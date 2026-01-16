'use client';

import React from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Avatar,
    Chip,
    Divider,
    List,
    ListItem,
    ListItemText,
    ListItemIcon
} from '@mui/material';
import {
    Hotel as HotelIcon,
    MeetingRoom as RoomIcon,
    CalendarToday as DateIcon,
    VerifiedUser as VerifiedIcon,
    Notifications as NotificationIcon,
    FiberManualRecord as BulletIcon
} from '@mui/icons-material';
import { mockApi, User, AppNotification } from '@/services/mockApi';
import { DashboardSkeleton } from '@/components/shared/SkeletonLoader';
import { motion } from 'framer-motion';

export default function UserDashboard() {
    const [data, setData] = React.useState<{
        user: User;
        notifications: AppNotification[];
    } | null>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchData = async () => {
            const [users, notifications] = await Promise.all([
                mockApi.getUsers(),
                mockApi.getNotifications()
            ]);
            // For mock purposes, we'll assume the first user is the logged in user
            setData({ user: users[0], notifications });
            setLoading(false);
        };
        fetchData();
    }, []);

    if (loading || !data) return <DashboardSkeleton />;

    const { user, notifications } = data;

    const infoCards = [
        { label: 'Room Number', value: user.room, icon: <RoomIcon color="primary" /> },
        { label: 'Bed Number', value: user.bed, icon: <HotelIcon color="secondary" /> },
        { label: 'Entry Date', value: user.entryDate || 'N/A', icon: <DateIcon color="success" /> },
        { label: 'Status', value: user.status, icon: <VerifiedIcon color="info" /> },
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
                        boxShadow: 3
                    }}
                >
                    {user.name[0]}
                </Avatar>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800 }}>Welcome, {user.name}!</Typography>
                    <Typography color="text.secondary">Resident of Saraswati Lodge • {user.email}</Typography>
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
                                <Typography variant="body2" color="text.secondary" gutterBottom>{card.label}</Typography>
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                    {card.label === 'Status' ? (
                                        <Chip label={card.value} color="success" size="small" sx={{ fontWeight: 600 }} />
                                    ) : card.value}
                                </Typography>
                            </Paper>
                        </motion.div>
                    </Grid>
                ))}

                <Grid size={{ xs: 12, md: 8 }}>
                    <Paper sx={{ p: 4, borderRadius: 4, height: '100%' }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Quick Actions & Info</Typography>
                        <Divider sx={{ mb: 3 }} />
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 3, cursor: 'pointer', transition: '0.2s', '&:hover': { bgcolor: 'action.selected' } }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>WiFi Details</Typography>
                                    <Typography variant="body2" color="text.secondary">SSID: Saraswati_Lodge_5G</Typography>
                                </Box>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 3, cursor: 'pointer', transition: '0.2s', '&:hover': { bgcolor: 'action.selected' } }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Maintenance</Typography>
                                    <Typography variant="body2" color="text.secondary">Request a fix for your room</Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper sx={{ p: 4, borderRadius: 4, height: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                            <NotificationIcon color="primary" />
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>Latest Updates</Typography>
                        </Box>
                        <List disablePadding>
                            {notifications.slice(0, 3).map((notif, i) => (
                                <Box key={notif.id}>
                                    <ListItem disableGutters alignItems="flex-start">
                                        <ListItemIcon sx={{ minWidth: 32, mt: 0.5 }}>
                                            <BulletIcon sx={{ fontSize: 12, color: 'primary.main' }} />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={notif.title}
                                            secondary={notif.message}
                                            primaryTypographyProps={{ variant: 'subtitle2', fontWeight: 600 }}
                                            secondaryTypographyProps={{ variant: 'caption', sx: { display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' } }}
                                        />
                                    </ListItem>
                                    {i < notifications.length - 1 && <Divider component="li" sx={{ my: 1, opacity: 0.5 }} />}
                                </Box>
                            ))}
                        </List>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}
