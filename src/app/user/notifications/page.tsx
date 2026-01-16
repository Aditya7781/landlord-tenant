'use client';

import React from 'react';
import {
    Box,
    Typography,
    Paper,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Divider,
    Button
} from '@mui/material';
import {
    Info as InfoIcon,
    Warning as WarningIcon,
    Schedule as ScheduleIcon,
    CheckCircle as ReadIcon
} from '@mui/icons-material';
import { mockApi, AppNotification } from '@/services/mockApi';
import { TableSkeleton } from '@/components/shared/SkeletonLoader';
import { motion, AnimatePresence } from 'framer-motion';

export default function UserNotifications() {
    const [notifications, setNotifications] = React.useState<AppNotification[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        mockApi.getNotifications().then(data => {
            setNotifications(data);
            setLoading(false);
        });
    }, []);

    if (loading) return <Box sx={{ p: 4 }}><TableSkeleton /></Box>;

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800 }}>Notifications</Typography>
                    <Typography color="text.secondary">Stay updated with the latest news from Saraswati Lodge</Typography>
                </Box>
                <Button variant="text" startIcon={<ReadIcon />}>Mark all as read</Button>
            </Box>

            <Paper sx={{ borderRadius: 4, overflow: 'hidden' }}>
                <AnimatePresence>
                    <List disablePadding>
                        {notifications.map((notif, index) => (
                            <motion.div
                                key={notif.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <ListItem
                                    sx={{
                                        py: 3,
                                        px: 4,
                                        borderLeft: '4px solid',
                                        borderColor: notif.type === 'alert' ? 'error.main' : notif.type === 'reminder' ? 'warning.main' : 'primary.main',
                                        bgcolor: index % 2 === 0 ? 'transparent' : 'action.hover',
                                        '&:hover': { bgcolor: 'action.selected' }
                                    }}
                                >
                                    <ListItemIcon sx={{ minWidth: 56 }}>
                                        <Box
                                            sx={{
                                                p: 1.5,
                                                borderRadius: 2,
                                                bgcolor: notif.type === 'alert' ? 'error.light' : notif.type === 'reminder' ? 'warning.light' : 'primary.light',
                                                color: 'white'
                                            }}
                                        >
                                            {notif.type === 'alert' ? <WarningIcon /> : notif.type === 'reminder' ? <ScheduleIcon /> : <InfoIcon />}
                                        </Box>
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{notif.title}</Typography>
                                                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>{notif.date}</Typography>
                                            </Box>
                                        }
                                        secondary={
                                            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                                                {notif.message}
                                            </Typography>
                                        }
                                    />
                                </ListItem>
                                {index < notifications.length - 1 && <Divider />}
                            </motion.div>
                        ))}
                    </List>
                </AnimatePresence>
            </Paper>
        </Box>
    );
}
