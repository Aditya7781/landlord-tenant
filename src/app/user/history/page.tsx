'use client';

import React from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Button
} from '@mui/material';
import {
    Download as DownloadIcon,
    FilterList as FilterIcon,
    ReceiptLong as ReceiptIcon
} from '@mui/icons-material';
import { mockApi, Payment } from '@/services/mockApi';
import { TableSkeleton } from '@/components/shared/SkeletonLoader';

export default function PaymentHistory() {
    const [history, setHistory] = React.useState<Payment[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        mockApi.getPayments().then(data => {
            // Show only paid ones for history
            setHistory(data.filter(p => p.status === 'Paid'));
            setLoading(false);
        });
    }, []);

    if (loading) return <Box sx={{ p: 4 }}><TableSkeleton /></Box>;

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800 }}>Payment History</Typography>
                    <Typography color="text.secondary">Access all your previous stay invoices</Typography>
                </Box>
                <Button variant="outlined" startIcon={<FilterIcon />} sx={{ borderRadius: 2 }}>
                    Filter History
                </Button>
            </Box>

            <TableContainer component={Paper} sx={{ borderRadius: 4, overflow: 'hidden' }}>
                <Table>
                    <TableHead sx={{ bgcolor: 'action.hover' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 700 }}>Month</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Receipt No</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Amount</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Method</TableCell>
                            <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {history.map((row) => (
                            <TableRow key={row.id} hover>
                                <TableCell sx={{ fontWeight: 600 }}>{row.month}</TableCell>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <ReceiptIcon fontSize="small" color="action" />
                                        <Typography variant="body2">{row.receiptNo}</Typography>
                                    </Box>
                                </TableCell>
                                <TableCell>{row.date}</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>{row.amount}</TableCell>
                                <TableCell>
                                    <Chip label={row.method} size="small" variant="outlined" sx={{ borderRadius: 1 }} />
                                </TableCell>
                                <TableCell align="right">
                                    <Button
                                        startIcon={<DownloadIcon />}
                                        size="small"
                                        sx={{ borderRadius: 2, fontWeight: 600 }}
                                    >
                                        PDF
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}
