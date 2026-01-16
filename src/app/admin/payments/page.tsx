'use client';

import React from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Button,
    IconButton,
    TextField,
    InputAdornment
} from '@mui/material';
import {
    Download as DownloadIcon,
    Send as SendIcon,
    Search as SearchIcon,
    FilterList as FilterIcon
} from '@mui/icons-material';
import { mockApi, Payment } from '@/services/mockApi';
import { TableSkeleton } from '@/components/shared/SkeletonLoader';

export default function PaymentManagement() {
    const [payments, setPayments] = React.useState<Payment[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        mockApi.getPayments().then(data => {
            setPayments(data);
            setLoading(false);
        });
    }, []);

    if (loading) return <Box sx={{ p: 4 }}><TableSkeleton /></Box>;

    const totalRevenue = payments
        .filter(p => p.status === 'Paid')
        .reduce((sum, p) => sum + parseInt(p.amount.replace(/[^0-9]/g, '')), 0);

    const pendingDues = payments
        .filter(p => p.status === 'Pending')
        .reduce((sum, p) => sum + parseInt(p.amount.replace(/[^0-9]/g, '')), 0);

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800 }}>Payment Management</Typography>
                    <Typography color="text.secondary">Monitor revenue, track dues, and generate reports</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button variant="outlined" startIcon={<DownloadIcon />} sx={{ borderRadius: 2 }}>Export CSV</Button>
                    <Button variant="contained" color="secondary" sx={{ borderRadius: 2 }}>Trigger Payment Links</Button>
                </Box>
            </Box>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <Paper sx={{ p: 3, borderRadius: 4, height: '100%', border: '1px solid', borderColor: 'success.light' }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>Total Revenue (Monthly)</Typography>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>₹{totalRevenue.toLocaleString()}</Typography>
                    </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <Paper sx={{ p: 3, borderRadius: 4, height: '100%', border: '1px solid', borderColor: 'warning.light' }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>Pending Dues</Typography>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>₹{pendingDues.toLocaleString()}</Typography>
                    </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <Paper sx={{ p: 3, borderRadius: 4, height: '100%', border: '1px solid', borderColor: 'primary.light' }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>Paid Residents</Typography>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                            {payments.filter(p => p.status === 'Paid').length} / {payments.length}
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>

            <Paper sx={{ borderRadius: 4, overflow: 'hidden' }}>
                <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>Payment Report</Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                            size="small"
                            placeholder="Search user..."
                            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
                            sx={{ width: 250 }}
                        />
                        <Button variant="outlined" startIcon={<FilterIcon />}>Filter</Button>
                    </Box>
                </Box>
                <TableContainer>
                    <Table>
                        <TableHead sx={{ bgcolor: 'action.hover' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 700 }}>User</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Month</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Amount</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {payments.map((payment) => (
                                <TableRow key={payment.id} hover>
                                    <TableCell sx={{ fontWeight: 600 }}>{payment.user}</TableCell>
                                    <TableCell>{payment.month}</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>{payment.amount}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={payment.status}
                                            color={payment.status === 'Paid' ? 'success' : 'warning'}
                                            size="small"
                                            sx={{ borderRadius: 1.5, fontWeight: 600 }}
                                        />
                                    </TableCell>
                                    <TableCell>{payment.date}</TableCell>
                                    <TableCell>
                                        <IconButton size="small" title="Send Reminder">
                                            <SendIcon fontSize="small" color="primary" />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Box>
    );
}
