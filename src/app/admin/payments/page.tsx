'use client';

import React, { useState, useEffect } from 'react';
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
    InputAdornment,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Divider,
    Link
} from '@mui/material';
import {
    Download as DownloadIcon,
    Send as SendIcon,
    Search as SearchIcon,
    FilterList as FilterIcon,
    Hotel as HotelIcon,
    CheckCircle as CheckCircleIcon,
    Error as ErrorIcon,
    ContentCopy as CopyIcon
} from '@mui/icons-material';
import { TableSkeleton } from '@/components/shared/SkeletonLoader';

const getCookieValue = (name: string): string | null => {
    if (typeof document === "undefined") return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
    return null;
};

interface PaymentItem {
    userEmail: string;
    userName: string;
    month: string;
    monthLabel: string;
    amount: number;
    status: 'paid' | 'pending';
    date: string;
    roomNo: string | null;
    bedName: string | null;
}

interface PaymentStats {
    totalPayments: number;
    paidCount: number;
    dueCount: number;
    totalRevenue: number;
    totalDues: number;
    monthlyBreakdown: Array<{
        month: string;
        monthLabel: string;
        revenue: number;
        dues: number;
        total: number;
        paidCount: number;
        dueCount: number;
    }>;
    beds: {
        total: number;
        occupied: number;
        vacant: number;
    };
}

interface PaymentResponse {
    filters: {
        month: string;
    };
    stats: PaymentStats;
    items: PaymentItem[];
}

interface TriggerResult {
    email: string;
    yearMonth: string;
    amount: number;
    url: string;
    status: 'success' | 'failed';
}

interface TriggerResponse {
    message: string;
    total: number;
    successful: number;
    failed: number;
    results: TriggerResult[];
}

export default function PaymentManagement() {
    const [data, setData] = useState<PaymentResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [triggerDialogOpen, setTriggerDialogOpen] = useState(false);
    const [triggerLoading, setTriggerLoading] = useState(false);
    const [triggerResult, setTriggerResult] = useState<TriggerResponse | null>(null);
    const token = getCookieValue("session_token");

    const fetchPayments = async (month?: string) => {
        
        if (!token) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const url = month && month !== 'all' 
                ? `/api/admin/payments?month=${encodeURIComponent(month)}`
                : '/api/admin/payments';
            
            
            
            const response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const result = await response.json();

            
            if (response.ok) {
                setData(result);
            } else {
                console.error("Failed to fetch payments:", result.message);
                alert(result.message || "Failed to fetch payment data");
            }
        } catch (error) {
            console.error("Payment fetch error:", error);
            const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
            console.error("Error details:", {
                message: errorMessage,
                stack: error instanceof Error ? error.stack : undefined,
                name: error instanceof Error ? error.name : "Unknown"
            });
            alert(`Network error: ${errorMessage || "Please try again."}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, [token]);

    useEffect(() => {
        if (token) {
            fetchPayments(selectedMonth);
        }
    }, [selectedMonth]);

    const handleTriggerNotifications = async () => {
        if (!token) {
            alert("No authentication token found");
            return;
        }

        setTriggerLoading(true);
        setTriggerDialogOpen(true);
        try {
            const response = await fetch("/api/payments/trigger", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const result = await response.json();
            if (response.ok) {
                setTriggerResult(result);
                // Refresh payment data after triggering
                fetchPayments(selectedMonth);
            } else {
                alert(result.message || "Failed to trigger notifications");
                setTriggerDialogOpen(false);
            }
        } catch (error) {
            console.error("Trigger notification error:", error);
            alert("Network error. Please try again.");
            setTriggerDialogOpen(false);
        } finally {
            setTriggerLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        // You could add a toast notification here
    };


    const filteredItems = data?.items.filter(item =>
        item.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.roomNo && item.roomNo.includes(searchTerm)) ||
        (item.bedName && item.bedName.includes(searchTerm))
    ) || [];

    // Get available months from monthlyBreakdown
    const availableMonths = data?.stats.monthlyBreakdown
        .filter(m => m.month !== 'PAY')
        .map(m => ({ value: m.month, label: m.monthLabel })) || [];

    if (loading && !data) {
        return <Box sx={{ p: 4 }}><TableSkeleton /></Box>;
    }

    if (!data) {
        return (
            <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="error">Failed to load payment data</Typography>
            </Box>
        );
    }

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });
        } catch {
            return dateString;
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800 }}>Payment Management</Typography>
                    <Typography color="text.secondary">Monitor revenue, track dues, and generate reports</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button variant="outlined" startIcon={<DownloadIcon />} sx={{ borderRadius: 2 }}>Export CSV</Button>
                    <Button 
                        variant="contained" 
                        color="secondary" 
                        sx={{ borderRadius: 2 }}
                        onClick={handleTriggerNotifications}
                        disabled={triggerLoading}
                    >
                        {triggerLoading ? 'Triggering...' : 'Trigger Payment Links'}
                    </Button>
                </Box>
            </Box>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Paper sx={{ p: 3, borderRadius: 4, height: '100%', border: '1px solid', borderColor: 'success.light' }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>Total Revenue</Typography>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                            ₹{data.stats.totalRevenue.toLocaleString('en-IN')}
                        </Typography>
                    </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Paper sx={{ p: 3, borderRadius: 4, height: '100%', border: '1px solid', borderColor: 'warning.light' }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>Pending Dues</Typography>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>
                            ₹{data.stats.totalDues.toLocaleString('en-IN')}
                        </Typography>
                    </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Paper sx={{ p: 3, borderRadius: 4, height: '100%', border: '1px solid', borderColor: 'primary.light' }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>Paid / Due</Typography>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                            {data.stats.paidCount} / {data.stats.dueCount}
                        </Typography>
                    </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Paper sx={{ p: 3, borderRadius: 4, height: '100%', border: '1px solid', borderColor: 'info.light' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <HotelIcon fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">Beds</Typography>
                        </Box>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: 'info.main' }}>
                            {data.stats.beds.occupied} / {data.stats.beds.total}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {data.stats.beds.vacant} vacant
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>

            <Paper sx={{ borderRadius: 4, overflow: 'hidden' }}>
                <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>Payment Report</Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <FormControl size="small" sx={{ minWidth: 200 }}>
                            <InputLabel>Filter by Month</InputLabel>
                            <Select
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                label="Filter by Month"
                                sx={{ borderRadius: 2 }}
                            >
                                <MenuItem value="all">All Months</MenuItem>
                                {availableMonths.map((month) => (
                                    <MenuItem key={month.value} value={month.value}>
                                        {month.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <TextField
                            size="small"
                            placeholder="Search user, email, room..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ width: 250 }}
                        />
                    </Box>
                </Box>
                <TableContainer>
                    <Table>
                        <TableHead sx={{ bgcolor: 'action.hover' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 700 }}>User</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Room / Bed</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Month</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Amount</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                                        <CircularProgress size={24} />
                                    </TableCell>
                                </TableRow>
                            ) : filteredItems.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                                        <Typography color="text.secondary">No payments found</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredItems.map((item, index) => (
                                    <TableRow key={`${item.userEmail}-${item.month}-${index}`} hover>
                                        <TableCell>
                                            <Box>
                                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                    {item.userName}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {item.userEmail}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            {item.roomNo && item.bedName ? (
                                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                    <Chip
                                                        label={`R-${item.roomNo}`}
                                                        size="small"
                                                        sx={{ fontWeight: 600, height: 24 }}
                                                    />
                                                    <Chip
                                                        label={`B-${item.bedName}`}
                                                        size="small"
                                                        variant="outlined"
                                                        sx={{ fontWeight: 600, height: 24 }}
                                                    />
                                                </Box>
                                            ) : (
                                                <Typography variant="caption" color="text.secondary">
                                                    Not Assigned
                                                </Typography>
                                            )}
                                        </TableCell>
                                        <TableCell>{item.monthLabel}</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>
                                            ₹{item.amount.toLocaleString('en-IN')}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={item.status === 'paid' ? 'Paid' : 'Pending'}
                                                color={item.status === 'paid' ? 'success' : 'warning'}
                                                size="small"
                                                sx={{ borderRadius: 1.5, fontWeight: 600 }}
                                            />
                                        </TableCell>
                                        <TableCell>{formatDate(item.date)}</TableCell>
                                        <TableCell>
                                            <IconButton size="small" title="Send Reminder" disabled={item.status === 'paid'}>
                                                <SendIcon fontSize="small" color={item.status === 'paid' ? 'disabled' : 'primary'} />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* Trigger Notification Results Dialog */}
            <Dialog
                open={triggerDialogOpen}
                onClose={() => {
                    setTriggerDialogOpen(false);
                    setTriggerResult(null);
                }}
                fullWidth
                maxWidth="md"
                PaperProps={{ sx: { borderRadius: 4 } }}
            >
                <DialogTitle sx={{ fontWeight: 800 }}>
                    Payment Links Generated
                </DialogTitle>
                <DialogContent>
                    {triggerLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
                            <CircularProgress />
                            <Typography sx={{ ml: 2 }}>Generating payment links...</Typography>
                        </Box>
                    ) : triggerResult ? (
                        <Box>
                            <Box sx={{ mb: 3, p: 2, bgcolor: 'success.light', borderRadius: 2 }}>
                                <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                                    {triggerResult.message}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 3, mt: 2 }}>
                                    <Typography variant="body2">
                                        <strong>Total:</strong> {triggerResult.total}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'success.main' }}>
                                        <strong>Successful:</strong> {triggerResult.successful}
                                    </Typography>
                                    {triggerResult.failed > 0 && (
                                        <Typography variant="body2" sx={{ color: 'error.main' }}>
                                            <strong>Failed:</strong> {triggerResult.failed}
                                        </Typography>
                                    )}
                                </Box>
                            </Box>

                            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
                                Payment Links:
                            </Typography>
                            <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                                {triggerResult.results.map((result, index) => (
                                    <Box key={index}>
                                        <Paper
                                            variant="outlined"
                                            sx={{
                                                p: 2,
                                                mb: 2,
                                                borderRadius: 2,
                                                bgcolor: result.status === 'success' ? 'action.hover' : 'error.light'
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                                                <Box>
                                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                        {result.email}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {result.yearMonth} • ₹{result.amount.toLocaleString('en-IN')}
                                                    </Typography>
                                                </Box>
                                                <Chip
                                                    icon={result.status === 'success' ? <CheckCircleIcon /> : <ErrorIcon />}
                                                    label={result.status === 'success' ? 'Success' : 'Failed'}
                                                    color={result.status === 'success' ? 'success' : 'error'}
                                                    size="small"
                                                    sx={{ fontWeight: 600 }}
                                                />
                                            </Box>
                                            {result.status === 'success' && result.url && (
                                                <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Link
                                                        href={result.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        sx={{ fontSize: '0.875rem', wordBreak: 'break-all' }}
                                                    >
                                                        {result.url}
                                                    </Link>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => copyToClipboard(result.url)}
                                                        title="Copy link"
                                                    >
                                                        <CopyIcon fontSize="small" />
                                                    </IconButton>
                                                </Box>
                                            )}
                                        </Paper>
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    ) : null}
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button
                        onClick={() => {
                            setTriggerDialogOpen(false);
                            setTriggerResult(null);
                        }}
                        sx={{ fontWeight: 700 }}
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
