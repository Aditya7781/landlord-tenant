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
  Button,
  Alert
} from '@mui/material';
import {
  Download as DownloadIcon,
  FilterList as FilterIcon,
  ReceiptLong as ReceiptIcon
} from '@mui/icons-material';
import { TableSkeleton } from '@/components/shared/SkeletonLoader';

type PaymentApiItem = {
  sk: string;
  status: string;
  amount: number;
  createdAt: string;
};

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

const formatAmount = (n: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n);

export default function PaymentHistory() {
  const [payments, setPayments] = React.useState<PaymentApiItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetch('/api/my?query=payment', { credentials: 'include' })
      .then(res => res.json().then(data => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) throw new Error(data.message || 'Failed to load payments');
        setPayments(data.payments || []);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Box sx={{ p: 4 }}><TableSkeleton /></Box>;

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Payment History
          </Typography>
          <Typography color="text.secondary">
            Access all your previous stay invoices
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<FilterIcon />} sx={{ borderRadius: 2 }}>
          Filter History
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 4 }}>
        <Table>
          <TableHead sx={{ bgcolor: 'action.hover' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Month</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Receipt No</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Amount</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {payments.map(p => {
              const month = p.sk.split('#')[1]; // 2026-01
              return (
                <TableRow key={p.sk} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{month}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <ReceiptIcon fontSize="small" />
                      <Typography variant="body2">{p.sk}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{formatDate(p.createdAt)}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>
                    {formatAmount(p.amount)}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={p.status}
                      size="small"
                      color={p.status === 'paid' ? 'success' : 'warning'}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Button startIcon={<DownloadIcon />} size="small">
                      PDF
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
