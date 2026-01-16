'use client';

import React from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Button,
    Divider,
    List,
    ListItem,
    ListItemText
} from '@mui/material';
import {
    Payment as PaymentIcon,
    Receipt as ReceiptIcon,
} from '@mui/icons-material';
import { mockApi, Payment } from '@/services/mockApi';
import { TableSkeleton } from '@/components/shared/SkeletonLoader';
import { motion } from 'framer-motion';

export default function UserPayments() {
    const [payment, setPayment] = React.useState<Payment | null>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        mockApi.getPayments().then(data => {
            // Find the first pending payment for the current month
            const pending = data.find(p => p.status === 'Pending') || data[0];
            setPayment(pending);
            setLoading(false);
        });
    }, []);

    if (loading || !payment) return <Box sx={{ p: 4 }}><TableSkeleton /></Box>;

    return (
        <Box>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>Payments & Bills</Typography>
                <Typography color="text.secondary">Pay your monthly dues and download receipts</Typography>
            </Box>

            <Grid container spacing={4}>
                <Grid size={{ xs: 12, md: 7 }}>
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <Paper
                            sx={{
                                p: { xs: 3, md: 5 },
                                borderRadius: 5,
                                bgcolor: 'primary.main',
                                color: 'primary.contrastText',
                                position: 'relative',
                                overflow: 'hidden',
                                boxShadow: '0 20px 40px rgba(59, 130, 246, 0.3)'
                            }}
                        >
                            <Box sx={{ position: 'relative', zIndex: 1 }}>
                                <Typography variant="h6" sx={{ opacity: 0.8, fontWeight: 500, mb: 1 }}>Amount Due</Typography>
                                <Typography variant="h2" sx={{ fontWeight: 800, mb: 4 }}>{payment.amount}</Typography>

                                <Box sx={{ display: 'flex', gap: 4, mb: 5 }}>
                                    <Box>
                                        <Typography variant="caption" sx={{ opacity: 0.7, textTransform: 'uppercase', letterSpacing: 1 }}>Month</Typography>
                                        <Typography variant="h6" sx={{ fontWeight: 600 }}>{payment.month}</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" sx={{ opacity: 0.7, textTransform: 'uppercase', letterSpacing: 1 }}>Due Date</Typography>
                                        <Typography variant="h6" sx={{ fontWeight: 600 }}>10th {payment.month.split(' ')[0]}</Typography>
                                    </Box>
                                </Box>

                                <Button
                                    variant="contained"
                                    size="large"
                                    fullWidth
                                    sx={{
                                        bgcolor: 'white',
                                        color: 'primary.main',
                                        py: 2,
                                        borderRadius: 3,
                                        fontWeight: 800,
                                        fontSize: '1.1rem',
                                        boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
                                        '&:hover': { bgcolor: '#f8fafc' }
                                    }}
                                    startIcon={<PaymentIcon />}
                                >
                                    Pay via UPI / Card
                                </Button>
                            </Box>

                            <Box
                                sx={{
                                    position: 'absolute',
                                    right: -50,
                                    top: -50,
                                    width: 250,
                                    height: 250,
                                    borderRadius: '50%',
                                    bgcolor: 'rgba(255,255,255,0.1)',
                                    zIndex: 0
                                }}
                            />
                        </Paper>
                    </motion.div>
                </Grid>

                <Grid size={{ xs: 12, md: 5 }}>
                    <Paper sx={{ p: 4, borderRadius: 4, height: '100%' }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Bill Breakdown</Typography>
                        <List disablePadding>
                            {[
                                { label: 'Monthly Room Rent', value: '₹5,000' },
                                { label: 'Maintenance & Service', value: '₹500' },
                                { label: 'Electricity (Common)', value: '₹0' },
                                { label: 'Late Fee (if any)', value: '₹0' },
                            ].map((item, i) => (
                                <ListItem key={i} sx={{ px: 0, py: 1.5 }}>
                                    <ListItemText primary={item.label} primaryTypographyProps={{ color: 'text.secondary' }} />
                                    <Typography sx={{ fontWeight: 600 }}>{item.value}</Typography>
                                </ListItem>
                            ))}
                            <Divider sx={{ my: 2 }} />
                            <ListItem sx={{ px: 0 }}>
                                <ListItemText primary="Total Amount" primaryTypographyProps={{ variant: 'h6', fontWeight: 800 }} />
                                <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main' }}>{payment.amount}</Typography>
                            </ListItem>
                        </List>

                        <Box sx={{ mt: 4, p: 2, borderRadius: 2, bgcolor: 'action.hover', border: '1px dashed', borderColor: 'divider' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <ReceiptIcon color="action" fontSize="small" />
                                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Payment Note</Typography>
                            </Box>
                            <Typography variant="caption" color="text.secondary">
                                Invoices are auto-generated. Please keep the transaction ID for future reference.
                            </Typography>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}
