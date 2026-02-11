'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
    Tooltip,
    Snackbar,
    Alert,
} from '@mui/material';
import {
    Search as SearchIcon,
    Add as AddIcon,
    Edit as EditIcon,
    Receipt as ReceiptIcon,
    CloudUpload as CloudUploadIcon,
    AccountBalanceWallet as WalletIcon,
    TrendingDown as TrendingDownIcon,
    CheckCircle as CheckCircleIcon,
    HourglassEmpty as PendingIcon,
} from '@mui/icons-material';
import { TableSkeleton } from '@/components/shared/SkeletonLoader';

const getCookieValue = (name: string): string | null => {
    if (typeof document === "undefined") return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
    return null;
};

// --- Types ---
interface ReceiptObject {
    uploadKey: string;
    uploadUrl: string;
}

interface ExpenseItem {
    PK: string;
    SK: string;
    name: string;
    amount: number;
    expenseType: string;
    paymentType: string;
    status: string;
    description: string;
    receipt: string | ReceiptObject | null;
    paidAt: string;
    createdAt: string;
    updatedAt: string;
}

interface FetchExpensesResponse {
    count: number;
    paidTotal: number;
    unpaidTotal: number;
    expenses: ExpenseItem[];
}

// --- Helpers ---
const getReceiptUrl = (receipt: ExpenseItem['receipt']): string | null => {
    if (!receipt) return null;
    if (typeof receipt === 'string') return receipt;
    if (typeof receipt === 'object' && receipt.uploadUrl) return receipt.uploadUrl;
    return null;
};

// --- Constants ---
const EXPENSE_TYPES = [
    'Electrician',
    'Plumber',
    'Sweeper',
    'Carpenter',
    'Painter',
    'Mason',
    'Pest Control',
    'Gardener',
    'Security',
    'Laundry',
    'Other',
];

const PAYMENT_TYPES = ['UPI', 'Cash', 'Bank Transfer', 'Cheque', 'Other'];

const CURRENT_YEAR = new Date().getFullYear();
const MONTHS = Array.from({ length: 12 }, (_, i) => {
    const m = (i + 1).toString().padStart(2, '0');
    const label = new Date(CURRENT_YEAR, i).toLocaleString('en-IN', { month: 'long' });
    return { value: `${CURRENT_YEAR}-${m}`, label: `${label} ${CURRENT_YEAR}` };
});

const INITIAL_FORM = {
    name: '',
    amount: '',
    expenseType: '',
    paymentType: '',
    description: '',
    status: 'paid',
};

export default function ExpenseManagement() {
    const [data, setData] = useState<FetchExpensesResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedQuery, setSelectedQuery] = useState<string>(String(CURRENT_YEAR));
    const [searchTerm, setSearchTerm] = useState('');
    const [professionFilter, setProfessionFilter] = useState<string>('all');
    const token = getCookieValue("session_token");

    // Create dialog
    const [createOpen, setCreateOpen] = useState(false);
    const [createForm, setCreateForm] = useState(INITIAL_FORM);
    const [receiptFile, setReceiptFile] = useState<File | null>(null);
    const [creating, setCreating] = useState(false);

    // Edit dialog
    const [editOpen, setEditOpen] = useState(false);
    const [editForm, setEditForm] = useState({
        name: '',
        amount: '',
        expenseType: '',
        paymentType: '',
        description: '',
        status: '',
        pk: '',
        sk: '',
        receipt: null as string | ReceiptObject | null,
    });
    const [editReceiptFile, setEditReceiptFile] = useState<File | null>(null);
    const [editing, setEditing] = useState(false);

    // Receipt preview
    const [receiptPreviewUrl, setReceiptPreviewUrl] = useState<string | null>(null);

    // Snackbar
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

    const showSnackbar = (message: string, severity: 'success' | 'error' = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    // --- Fetch expenses ---
    const fetchExpenses = useCallback(async (query?: string) => {
        if (!token) { setLoading(false); return; }
        setLoading(true);
        try {
            const q = query || selectedQuery;
            const url = `/api/admin/expenses?query=${encodeURIComponent(q)}`;
            const response = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const result = await response.json();
            if (response.ok) {
                setData(result);
            } else {
                showSnackbar(result.message || 'Failed to fetch expenses', 'error');
            }
        } catch (error) {
            console.error("Expense fetch error:", error);
            showSnackbar('Network error. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    }, [token, selectedQuery]);

    useEffect(() => { fetchExpenses(); }, [fetchExpenses]);

    // --- Helper for uploading receipt ---
    const uploadReceipt = async (file: File, name: string, expenseType: string): Promise<ReceiptObject | null> => {
        try {
            // 1. Get presigned URL
            const presignedRes = await fetch('/api/admin/expenses/presigned', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name,
                    expenseType,
                    fileType: file.type,
                }),
            });
            const presignedData = await presignedRes.json();
            if (!presignedRes.ok) throw new Error(presignedData.message || 'Failed to get upload URL');

            // 2. Upload file to S3 via presigned URL
            const uploadRes = await fetch(presignedData.presignedUrl, {
                method: 'PUT',
                headers: { 'Content-Type': file.type },
                body: file,
            });
            if (!uploadRes.ok) throw new Error('Failed to upload receipt file');

            // 3. Build receipt object
            const uploadUrl = presignedData.presignedUrl.split('?')[0];
            return {
                uploadKey: presignedData.uploadKey,
                uploadUrl,
            };
        } catch (error) {
            console.error("Upload error:", error);
            throw error;
        }
    };

    // --- Create expense ---
    const handleCreate = async () => {
        if (!token) return;
        const { name, amount, expenseType, paymentType, description, status } = createForm;
        if (!name || !amount || !expenseType || !paymentType) {
            showSnackbar('Please fill all required fields', 'error');
            return;
        }
        
        // Check if receipt is required
        if (status === 'paid' && paymentType.toLowerCase() !== 'cash' && !receiptFile) {
             showSnackbar('Receipt is required for paid non-cash expenses', 'error');
             return;
        }

        setCreating(true);
        try {
            let receipt: ReceiptObject | undefined;

            if (receiptFile) {
                const uploaded = await uploadReceipt(receiptFile, name, expenseType);
                if (uploaded) receipt = uploaded;
            }

            const body: Record<string, unknown> = {
                name,
                amount: Number(amount),
                expenseType,
                paymentType: paymentType.toLowerCase(),
                description,
                status,
                paidAt: status === 'paid' ? new Date().toISOString() : undefined,
            };
            if (receipt) {
                body.receipt = receipt;
            }

            const response = await fetch('/api/admin/expenses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            });
            const result = await response.json();
            if (response.ok) {
                showSnackbar('Expense created successfully');
                setCreateOpen(false);
                setCreateForm(INITIAL_FORM);
                setReceiptFile(null);
                fetchExpenses();
            } else {
                showSnackbar(result.message || 'Failed to create expense', 'error');
            }
        } catch (error) {
            console.error("Create expense error:", error);
            const msg = error instanceof Error ? error.message : 'Network error. Please try again.';
            showSnackbar(msg, 'error');
        } finally {
            setCreating(false);
        }
    };

    // --- Edit expense ---
    const handleOpenEdit = (expense: ExpenseItem) => {
        setEditForm({
            name: expense.name,
            amount: String(expense.amount),
            expenseType: EXPENSE_TYPES.find(t => t.toLowerCase() === expense.expenseType.toLowerCase()) || expense.expenseType,
            paymentType: PAYMENT_TYPES.find(t => t.toLowerCase() === expense.paymentType.toLowerCase()) || expense.paymentType,
            description: expense.description || '',
            status: expense.status === 'pending' ? 'unpaid' : expense.status,
            pk: expense.PK,
            sk: expense.SK,
            receipt: expense.receipt,
        });
        setEditReceiptFile(null);
        setEditOpen(true);
    };

    const handleEdit = async () => {
        if (!token) return;
        
        // Validate receipt requirement
        const isPaid = editForm.status === 'paid';
        const isNotCash = editForm.paymentType.toLowerCase() !== 'cash';
        const hasExistingReceipt = !!editForm.receipt;
        const hasNewReceipt = !!editReceiptFile;
        
        if (isPaid && isNotCash && !hasExistingReceipt && !hasNewReceipt) {
            showSnackbar('Receipt is required for paid non-cash expenses', 'error');
            return;
        }

        setEditing(true);
        try {
            let receiptPayload = editForm.receipt;

            // Upload new receipt if selected
            if (editReceiptFile) {
                 const uploaded = await uploadReceipt(editReceiptFile, editForm.name, editForm.expenseType);
                 if (uploaded) receiptPayload = uploaded;
            }

            const response = await fetch('/api/admin/expenses/edit', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    pk: editForm.pk,
                    sk: editForm.sk,
                    newName: editForm.name,
                    amount: Number(editForm.amount),
                    expenseType: editForm.expenseType,
                    paymentType: editForm.paymentType.toLowerCase(),
                    description: editForm.description,
                    status: editForm.status,
                    paidAt: editForm.status === 'paid' ? new Date().toISOString() : undefined,
                    receipt: receiptPayload, // Can be old receipt or new uploaded receipt object
                }),
            });
            const result = await response.json();
            if (response.ok) {
                showSnackbar('Expense updated successfully');
                setEditOpen(false);
                fetchExpenses();
            } else {
                showSnackbar(result.message || 'Failed to update expense', 'error');
            }
        } catch (error) {
            console.error("Edit expense error:", error);
             const msg = error instanceof Error ? error.message : 'Network error. Please try again.';
            showSnackbar(msg, 'error');
        } finally {
            setEditing(false);
        }
    };

    // --- Derived data ---
    const expenses = data?.expenses || [];
    const totalExpense = (data?.paidTotal || 0) + (data?.unpaidTotal || 0);
    const paidCount = expenses.filter(e => e.status === 'paid').length;
    const pendingCount = expenses.filter(e => e.status !== 'paid').length;

    // Unique profession types from current data
    const professionTypes = Array.from(new Set(expenses.map(e => e.expenseType.toLowerCase())));

    // Filter + sort (newest first by createdAt)
    const filteredExpenses = expenses
        .filter(item => {
            const matchesSearch =
                item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.expenseType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.description.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesProfession =
                professionFilter === 'all' || item.expenseType.toLowerCase() === professionFilter;
            return matchesSearch && matchesProfession;
        })
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
            });
        } catch {
            return dateString;
        }
    };

    // --- Render ---
    if (loading && !data) {
        return <Box sx={{ p: 4 }}><TableSkeleton /></Box>;
    }

    return (
        <Box>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800 }}>Expense Management</Typography>
                    <Typography color="text.secondary">Track and manage all hostel expenses</Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    sx={{ borderRadius: 2, fontWeight: 700 }}
                    onClick={() => setCreateOpen(true)}
                >
                    Create Expense
                </Button>
            </Box>

            {/* Stat Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Paper sx={{ p: 3, borderRadius: 4, height: '100%', border: '1px solid', borderColor: 'error.light' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <TrendingDownIcon fontSize="small" color="error" />
                            <Typography variant="body2" color="text.secondary">Total Expense</Typography>
                        </Box>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: 'error.main' }}>
                            ₹{totalExpense.toLocaleString('en-IN')}
                        </Typography>
                    </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Paper sx={{ p: 3, borderRadius: 4, height: '100%', border: '1px solid', borderColor: 'info.light' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <WalletIcon fontSize="small" color="info" />
                            <Typography variant="body2" color="text.secondary">Expense Count</Typography>
                        </Box>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: 'info.main' }}>
                            {data?.count || 0}
                        </Typography>
                    </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Paper sx={{ p: 3, borderRadius: 4, height: '100%', border: '1px solid', borderColor: 'success.light' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <CheckCircleIcon fontSize="small" color="success" />
                            <Typography variant="body2" color="text.secondary">Paid</Typography>
                        </Box>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                            {paidCount}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            ₹{(data?.paidTotal || 0).toLocaleString('en-IN')}
                        </Typography>
                    </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Paper sx={{ p: 3, borderRadius: 4, height: '100%', border: '1px solid', borderColor: 'warning.light' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <PendingIcon fontSize="small" color="warning" />
                            <Typography variant="body2" color="text.secondary">Pending</Typography>
                        </Box>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>
                            {pendingCount}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            ₹{(data?.unpaidTotal || 0).toLocaleString('en-IN')}
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>

            {/* Table */}
            <Paper sx={{ borderRadius: 4, overflow: 'hidden' }}>
                <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>Expense Report</Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                        <FormControl size="small" sx={{ minWidth: 180 }}>
                            <InputLabel>Filter by Period</InputLabel>
                            <Select
                                value={selectedQuery}
                                onChange={(e) => {
                                    setSelectedQuery(e.target.value);
                                    fetchExpenses(e.target.value);
                                }}
                                label="Filter by Period"
                                sx={{ borderRadius: 2 }}
                            >
                                <MenuItem value="all">All Time</MenuItem>
                                <MenuItem value={String(CURRENT_YEAR)}>{CURRENT_YEAR}</MenuItem>
                                {MONTHS.map((m) => (
                                    <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl size="small" sx={{ minWidth: 170 }}>
                            <InputLabel>Filter by Type</InputLabel>
                            <Select
                                value={professionFilter}
                                onChange={(e) => setProfessionFilter(e.target.value)}
                                label="Filter by Type"
                                sx={{ borderRadius: 2 }}
                            >
                                <MenuItem value="all">All Types</MenuItem>
                                {professionTypes.map((type) => (
                                    <MenuItem key={type} value={type} sx={{ textTransform: 'capitalize' }}>
                                        {type.charAt(0).toUpperCase() + type.slice(1)}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <TextField
                            size="small"
                            placeholder="Search name, type..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ width: 200 }}
                        />
                        <Chip
                            label={`Paid Total: ₹${(data?.paidTotal || 0).toLocaleString('en-IN')}`}
                            color="success"
                            variant="outlined"
                            sx={{ fontWeight: 700, fontSize: '0.85rem', height: 36, px: 1 }}
                        />
                    </Box>
                </Box>
                <TableContainer>
                    <Table>
                        <TableHead sx={{ bgcolor: 'action.hover' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Amount</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Payment</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                                        <CircularProgress size={24} />
                                    </TableCell>
                                </TableRow>
                            ) : filteredExpenses.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                                        <Typography color="text.secondary">No expenses found</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredExpenses.map((item, index) => {
                                    const receiptUrl = getReceiptUrl(item.receipt);
                                    return (
                                        <TableRow key={`${item.PK}-${item.SK}-${index}`} hover>
                                            <TableCell>
                                                <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.name}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip label={item.expenseType} size="small" sx={{ textTransform: 'capitalize', fontWeight: 600, height: 24 }} />
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>
                                                ₹{item.amount.toLocaleString('en-IN')}
                                            </TableCell>
                                            <TableCell>
                                                <Chip label={item.paymentType.toUpperCase()} size="small" variant="outlined" sx={{ fontWeight: 600, height: 24 }} />
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={item.status === 'paid' ? 'Paid' : 'Pending'}
                                                    color={item.status === 'paid' ? 'success' : 'warning'}
                                                    size="small"
                                                    sx={{ borderRadius: 1.5, fontWeight: 600 }}
                                                />
                                            </TableCell>
                                            <TableCell>{formatDate(item.paidAt || item.createdAt)}</TableCell>
                                            <TableCell>
                                                <Typography variant="body2" sx={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {item.description || '—'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                    <Tooltip title="Edit">
                                                        <IconButton size="small" onClick={() => handleOpenEdit(item)}>
                                                            <EditIcon fontSize="small" color="primary" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    {receiptUrl && (
                                                        <Tooltip title="View Receipt">
                                                            <IconButton size="small" onClick={() => setReceiptPreviewUrl(receiptUrl)}>
                                                                <ReceiptIcon fontSize="small" color="action" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* Create Expense Dialog */}
            <Dialog
                open={createOpen}
                onClose={() => { if (!creating) { setCreateOpen(false); setCreateForm(INITIAL_FORM); setReceiptFile(null); } }}
                fullWidth
                maxWidth="sm"
                PaperProps={{ sx: { borderRadius: 4 } }}
            >
                <DialogTitle sx={{ fontWeight: 800 }}>Create Expense</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
                        <TextField
                            label="Name *"
                            value={createForm.name}
                            onChange={(e) => setCreateForm(f => ({ ...f, name: e.target.value }))}
                            fullWidth
                            size="small"
                        />
                        <TextField
                            label="Amount *"
                            type="number"
                            value={createForm.amount}
                            onChange={(e) => setCreateForm(f => ({ ...f, amount: e.target.value }))}
                            fullWidth
                            size="small"
                            InputProps={{
                                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                            }}
                        />
                        <FormControl fullWidth size="small">
                            <InputLabel>Expense Type *</InputLabel>
                            <Select
                                value={createForm.expenseType}
                                onChange={(e) => setCreateForm(f => ({ ...f, expenseType: e.target.value }))}
                                label="Expense Type *"
                            >
                                {EXPENSE_TYPES.map(t => (
                                    <MenuItem key={t} value={t}>{t}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth size="small">
                            <InputLabel>Payment Type *</InputLabel>
                            <Select
                                value={createForm.paymentType}
                                onChange={(e) => setCreateForm(f => ({ ...f, paymentType: e.target.value }))}
                                label="Payment Type *"
                            >
                                {PAYMENT_TYPES.map(t => (
                                    <MenuItem key={t} value={t}>{t}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth size="small">
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={createForm.status}
                                onChange={(e) => setCreateForm(f => ({ ...f, status: e.target.value }))}
                                label="Status"
                            >
                                <MenuItem value="paid">Paid</MenuItem>
                                <MenuItem value="unpaid">Pending</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField
                            label="Description"
                            value={createForm.description}
                            onChange={(e) => setCreateForm(f => ({ ...f, description: e.target.value }))}
                            fullWidth
                            size="small"
                            multiline
                            rows={2}
                        />
                        <Button
                            variant="outlined"
                            component="label"
                            startIcon={<CloudUploadIcon />}
                            sx={{ borderRadius: 2, textTransform: 'none' }}
                        >
                            {receiptFile ? receiptFile.name : 'Upload Receipt'}
                            <input
                                type="file"
                                hidden
                                accept="image/*"
                                onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                            />
                        </Button>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button
                        onClick={() => { setCreateOpen(false); setCreateForm(INITIAL_FORM); setReceiptFile(null); }}
                        disabled={creating}
                        sx={{ fontWeight: 700 }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleCreate}
                        disabled={creating}
                        sx={{ fontWeight: 700, borderRadius: 2 }}
                    >
                        {creating ? <CircularProgress size={20} /> : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Edit Expense Dialog */}
            <Dialog
                open={editOpen}
                onClose={() => { if (!editing) { setEditOpen(false); setEditReceiptFile(null); } }}
                fullWidth
                maxWidth="sm"
                PaperProps={{ sx: { borderRadius: 4 } }}
            >
                <DialogTitle sx={{ fontWeight: 800 }}>Edit Expense</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
                        <TextField
                            label="Name"
                            value={editForm.name}
                            onChange={(e) => setEditForm(f => ({ ...f, name: e.target.value }))}
                            fullWidth
                            size="small"
                        />
                        <TextField
                            label="Amount"
                            type="number"
                            value={editForm.amount}
                            onChange={(e) => setEditForm(f => ({ ...f, amount: e.target.value }))}
                            fullWidth
                            size="small"
                            InputProps={{
                                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                            }}
                        />
                        <FormControl fullWidth size="small">
                            <InputLabel>Expense Type</InputLabel>
                            <Select
                                value={editForm.expenseType}
                                onChange={(e) => setEditForm(f => ({ ...f, expenseType: e.target.value }))}
                                label="Expense Type"
                            >
                                {EXPENSE_TYPES.map(t => (
                                    <MenuItem key={t} value={t}>{t}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth size="small">
                            <InputLabel>Payment Type</InputLabel>
                            <Select
                                value={editForm.paymentType}
                                onChange={(e) => setEditForm(f => ({ ...f, paymentType: e.target.value }))}
                                label="Payment Type"
                            >
                                {PAYMENT_TYPES.map(t => (
                                    <MenuItem key={t} value={t}>{t}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth size="small">
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={editForm.status}
                                onChange={(e) => setEditForm(f => ({ ...f, status: e.target.value }))}
                                label="Status"
                            >
                                <MenuItem value="paid">Paid</MenuItem>
                                <MenuItem value="unpaid">Pending</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField
                            label="Description"
                            value={editForm.description}
                            onChange={(e) => setEditForm(f => ({ ...f, description: e.target.value }))}
                            fullWidth
                            size="small"
                            multiline
                            rows={2}
                        />
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Button
                                variant="outlined"
                                component="label"
                                startIcon={<CloudUploadIcon />}
                                sx={{ borderRadius: 2, textTransform: 'none' }}
                            >
                                {editReceiptFile ? editReceiptFile.name : (getReceiptUrl(editForm.receipt) ? 'Change Receipt' : 'Upload Receipt')}
                                <input
                                    type="file"
                                    hidden
                                    accept="image/*"
                                    onChange={(e) => setEditReceiptFile(e.target.files?.[0] || null)}
                                />
                            </Button>
                            {getReceiptUrl(editForm.receipt) && !editReceiptFile && (
                                <Typography variant="caption" color="text.secondary">
                                    Current Receipt: {typeof editForm.receipt === 'object' && editForm.receipt ? 'File' : 'Link'}
                                </Typography>
                            )}
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => { setEditOpen(false); setEditReceiptFile(null); }} disabled={editing} sx={{ fontWeight: 700 }}>Cancel</Button>
                    <Button variant="contained" onClick={handleEdit} disabled={editing} sx={{ fontWeight: 700, borderRadius: 2 }}>
                        {editing ? <CircularProgress size={20} /> : 'Save'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Receipt Preview Dialog */}
            <Dialog
                open={!!receiptPreviewUrl}
                onClose={() => setReceiptPreviewUrl(null)}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { borderRadius: 4 } }}
            >
                <DialogTitle sx={{ fontWeight: 800 }}>Receipt</DialogTitle>
                <DialogContent>
                    {receiptPreviewUrl && (
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={receiptPreviewUrl}
                                alt="Receipt"
                                style={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: 8 }}
                            />
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setReceiptPreviewUrl(null)} sx={{ fontWeight: 700 }}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar(s => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={() => setSnackbar(s => ({ ...s, open: false }))} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
