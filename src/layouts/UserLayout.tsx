'use client';

import React from 'react';
import DashboardLayout from '@/components/shared/DashboardLayout';
import {
    Dashboard as DashboardIcon,
    Payment as PaymentIcon,
    Notifications as NotificationsIcon,
    History as HistoryIcon,
} from '@mui/icons-material';

const userMenuItems = [
    { text: 'My Dashboard', icon: <DashboardIcon />, path: '/user/dashboard' },
    { text: 'Payments', icon: <PaymentIcon />, path: '/user/payments' },
    { text: 'Payment History', icon: <HistoryIcon />, path: '/user/history' },
    { text: 'Notifications', icon: <NotificationsIcon />, path: '/user/notifications' },
];

export default function UserLayout({ children }: { children: React.ReactNode }) {
    return (
        <DashboardLayout menuItems={userMenuItems} title="Lodge Resident Portal">
            {children}
        </DashboardLayout>
    );
}
