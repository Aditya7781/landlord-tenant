'use client';

import React from 'react';
import jsPDF from 'jspdf';
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
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Divider
} from '@mui/material';
import {
  Download as DownloadIcon,
  FilterList as FilterIcon,
  ReceiptLong as ReceiptIcon,
  Close as CloseIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { TableSkeleton } from '@/components/shared/SkeletonLoader';

type PaymentApiItem = {
  sk: string;
  receipt?: string;
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

  // Function to validate Razorpay receipt format
  const isValidRazorpayReceipt = (receipt?: string): boolean => {
    if (!receipt) return false;
    // Razorpay receipt format: pay_S9dg3RNj3vBvO0
    const razorpayPattern = /^pay_[a-zA-Z0-9]{14}$/;
    return razorpayPattern.test(receipt);
  };

export default function PaymentHistory() {
  const [payments, setPayments] = React.useState<PaymentApiItem[]>([]);
  const [filteredPayments, setFilteredPayments] = React.useState<PaymentApiItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [filterDialogOpen, setFilterDialogOpen] = React.useState(false);
  const [selectedMonth, setSelectedMonth] = React.useState<string>('');
  const [selectedStatus, setSelectedStatus] = React.useState<string>('');
  const [receiptDialogOpen, setReceiptDialogOpen] = React.useState(false);
  const [selectedPayment, setSelectedPayment] = React.useState<PaymentApiItem | null>(null);

  // Get unique months from payments for filter options
  const getUniqueMonths = (paymentList: PaymentApiItem[]) => {
    const months = paymentList.map(p => {
      const month = p.sk.split('#')[1]; // 2026-01
      return month;
    }).filter(Boolean);
    return [...new Set(months)].sort().reverse();
  };

  // Apply filters
  const applyFilters = () => {
    let filtered = [...payments];
    
    if (selectedMonth) {
      filtered = filtered.filter(p => {
        const month = p.sk.split('#')[1];
        return month === selectedMonth;
      });
    }
    
    if (selectedStatus) {
      filtered = filtered.filter(p => p.status === selectedStatus);
    }
    
    setFilteredPayments(filtered);
    setFilterDialogOpen(false);
  };

  // Clear filters
  const clearFilters = () => {
    setSelectedMonth('');
    setSelectedStatus('');
    setFilteredPayments(payments);
    setFilterDialogOpen(false);
  };

  // Update filtered payments when payments change
  React.useEffect(() => {
    setFilteredPayments(payments);
  }, [payments]);

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
        <Button 
          variant="outlined" 
          startIcon={<FilterIcon />} 
          sx={{ borderRadius: 2 }}
          onClick={() => setFilterDialogOpen(true)}
        >
          Filter History
          {(selectedMonth || selectedStatus) && (
            <Chip 
              size="small" 
              label={Object.keys({ month: selectedMonth, status: selectedStatus }).filter(key => 
                (key === 'month' && selectedMonth) || (key === 'status' && selectedStatus)
              ).length} 
              sx={{ ml: 1, minWidth: 20, height: 20 }} 
            />
          )}
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
            {filteredPayments.map(p => {
              const month = p.sk.split('#')[1]; // 2026-01
              return (
                <TableRow key={p.sk} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{month}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <ReceiptIcon fontSize="small" />
                      <Typography variant="body2">
                        {p.receipt || `REC-${p.sk.split('#')[1] || 'UNKNOWN'}`}
                      </Typography>
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
                    <Button 
                      startIcon={isValidRazorpayReceipt(p.receipt) ? <ViewIcon /> : <DownloadIcon />} 
                      size="small"
                      disabled={!isValidRazorpayReceipt(p.receipt)}
                      onClick={() => {
                        if (isValidRazorpayReceipt(p.receipt)) {
                          setSelectedPayment(p);
                          setReceiptDialogOpen(true);
                        }
                      }}
                      sx={{
                        '&:disabled': {
                          opacity: 0.5,
                          cursor: 'not-allowed'
                        }
                      }}
                    >
                      {isValidRazorpayReceipt(p.receipt) ? 'View Receipt' : 'PDF'}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Filter Dialog */}
      <Dialog 
        open={filterDialogOpen} 
        onClose={() => setFilterDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Filter Payment History
          <IconButton onClick={() => setFilterDialogOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Month</InputLabel>
              <Select
                value={selectedMonth}
                label="Month"
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                <MenuItem value="">All Months</MenuItem>
                {getUniqueMonths(payments).map(month => (
                  <MenuItem key={month} value={month}>{month}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={selectedStatus}
                label="Status"
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="paid">Paid</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="failed">Failed</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={clearFilters} color="secondary">
            Clear All
          </Button>
          <Button onClick={() => setFilterDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={applyFilters} variant="contained">
            Apply Filters
          </Button>
        </DialogActions>
      </Dialog>

      {/* Receipt Display Dialog */}
      <Dialog 
        open={receiptDialogOpen} 
        onClose={() => setReceiptDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 4 }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          bgcolor: 'primary.main',
          color: 'primary.contrastText'
        }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Payment Receipt
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              Transaction ID: {selectedPayment?.receipt}
            </Typography>
          </Box>
          <IconButton onClick={() => setReceiptDialogOpen(false)} size="small" sx={{ color: 'inherit' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {selectedPayment && (
            <Box sx={{ 
              bgcolor: 'grey.50',
              p: 4,
              border: '2px dashed',
              borderColor: 'primary.light'
            }}>
              {/* Receipt Header */}
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main', mb: 1 }}>
                  PAYMENT RECEIPT
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  This is a system-generated receipt
                </Typography>
              </Box>

              {/* Payment Details */}
              <Paper sx={{ p: 3, mb: 3, bgcolor: 'white' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'primary.main' }}>
                  Payment Details
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                    <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 45%' } }}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                          Receipt Number
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {selectedPayment.receipt}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 45%' } }}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                          Payment Date
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {formatDate(selectedPayment.createdAt)}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 45%' } }}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                          Billing Month
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {selectedPayment.sk.split('#')[1]}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 45%' } }}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                          Payment Status
                        </Typography>
                        <Chip
                          label={selectedPayment.status}
                          size="small"
                          color={selectedPayment.status === 'paid' ? 'success' : 'warning'}
                          sx={{ fontWeight: 600 }}
                        />
                      </Box>
                    </Box>
                  </Box>
              </Paper>

              {/* Amount Details */}
              <Paper sx={{ p: 3, mb: 3, bgcolor: 'white' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'primary.main' }}>
                  Amount Details
                </Typography>
                {(() => {
                  const totalAmount = selectedPayment.amount;
                  const rent = Math.min(5000, totalAmount);
                  const remaining = totalAmount - rent;
                  const maintenance = Math.min(500, remaining);
                  const electricity = Math.min(0, remaining - maintenance);
                  const lateFee = Math.max(0, remaining - maintenance - electricity);
                  
                  return (
                    <>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="body1">Monthly Room Rent</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {formatAmount(rent)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="body1">Maintenance & Service</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {formatAmount(maintenance)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="body1">Electricity (Common)</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {formatAmount(electricity)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="body1">Late Fee (if any)</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {formatAmount(lateFee)}
                        </Typography>
                      </Box>
                      <Divider sx={{ my: 2 }} />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="h6" sx={{ fontWeight: 800 }}>Total Amount Paid</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main' }}>
                          {formatAmount(totalAmount)}
                        </Typography>
                      </Box>
                    </>
                  );
                })()}
              </Paper>

              {/* Footer */}
              <Box sx={{ textAlign: 'center', mt: 4 }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                  Powered by Razorpay Payment Gateway
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  This receipt serves as proof of payment. Please save for your records.
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: 'grey.50' }}>
          <Button 
            onClick={() => setReceiptDialogOpen(false)}
            variant="outlined"
          >
            Close
          </Button>
          <Button 
            onClick={() => {
              if (selectedPayment) {
                // Calculate amounts
                const totalAmount = selectedPayment.amount;
                const rent = Math.min(5000, totalAmount);
                const remaining = totalAmount - rent;
                const maintenance = Math.min(500, remaining);
                const electricity = Math.min(0, remaining - maintenance);
                const lateFee = Math.max(0, remaining - maintenance - electricity);
                
                // Initialize jsPDF
                const doc = new jsPDF();
                
                // Set font
                doc.setFont('helvetica');
                
                // Header
                doc.setFontSize(24);
                doc.setTextColor(25, 118, 210); // Primary color
                doc.text('PAYMENT RECEIPT', 105, 30, { align: 'center' });
                
                doc.setFontSize(12);
                doc.setTextColor(100, 100, 100);
                doc.text('This is a system-generated receipt', 105, 40, { align: 'center' });
                
                // Payment Details Section
                doc.setFontSize(16);
                doc.setTextColor(25, 118, 210);
                doc.text('Payment Details', 20, 65);
                
                doc.setDrawColor(200, 200, 200);
                doc.line(20, 70, 190, 70);
                
                doc.setFontSize(11);
                doc.setTextColor(0, 0, 0);
                
                // Payment details in two columns
                const detailsY = 80;
                const leftCol = 20;
                const rightCol = 110;
                const lineHeight = 8;
                
                doc.setTextColor(100, 100, 100);
                doc.setFontSize(9);
                doc.text('Receipt Number', leftCol, detailsY);
                doc.text('Payment Date', rightCol, detailsY);
                
                doc.setTextColor(0, 0, 0);
                doc.setFontSize(11);
                doc.text(selectedPayment.receipt, leftCol, detailsY + lineHeight);
                doc.text(formatDate(selectedPayment.createdAt), rightCol, detailsY + lineHeight);
                
                doc.setTextColor(100, 100, 100);
                doc.setFontSize(9);
                doc.text('Billing Month', leftCol, detailsY + lineHeight * 3);
                doc.text('Payment Status', rightCol, detailsY + lineHeight * 3);
                
                doc.setTextColor(0, 0, 0);
                doc.setFontSize(11);
                doc.text(selectedPayment.sk.split('#')[1], leftCol, detailsY + lineHeight * 4);
                
                // Status badge
                const statusText = selectedPayment.status.toUpperCase();
                const statusColor = selectedPayment.status === 'paid' ? [46, 125, 50] : [245, 124, 0];
                doc.setTextColor(...statusColor);
                doc.text(statusText, rightCol, detailsY + lineHeight * 4);
                
                // Amount Details Section
                doc.setFontSize(16);
                doc.setTextColor(25, 118, 210);
                doc.text('Amount Details', 20, 130);
                
                doc.setDrawColor(200, 200, 200);
                doc.line(20, 135, 190, 135);
                
                // Amount table
                doc.setFontSize(11);
                doc.setTextColor(0, 0, 0);
                
                const amountY = 145;
                const amountLineHeight = 10;
                
                doc.text('Monthly Room Rent', 20, amountY);
                doc.text(formatAmount(rent), 170, amountY, { align: 'right' });
                
                doc.text('Maintenance & Service', 20, amountY + amountLineHeight);
                doc.text(formatAmount(maintenance), 170, amountY + amountLineHeight, { align: 'right' });
                
                doc.text('Electricity (Common)', 20, amountY + amountLineHeight * 2);
                doc.text(formatAmount(electricity), 170, amountY + amountLineHeight * 2, { align: 'right' });
                
                doc.text('Late Fee (if any)', 20, amountY + amountLineHeight * 3);
                doc.text(formatAmount(lateFee), 170, amountY + amountLineHeight * 3, { align: 'right' });
                
                // Total line
                doc.setDrawColor(25, 118, 210);
                doc.setLineWidth(1);
                doc.line(20, amountY + amountLineHeight * 4 + 2, 190, amountY + amountLineHeight * 4 + 2);
                
                doc.setFontSize(14);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(25, 118, 210);
                doc.text('Total Amount Paid', 20, amountY + amountLineHeight * 5);
                doc.text(formatAmount(totalAmount), 170, amountY + amountLineHeight * 5, { align: 'right' });
                
                // Footer
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(10);
                doc.setTextColor(100, 100, 100);
                doc.text('Powered by Razorpay Payment Gateway', 105, 260, { align: 'center' });
                doc.text('This receipt serves as proof of payment. Please save for your records.', 105, 267, { align: 'center' });
                doc.text(`Generated on ${new Date().toLocaleDateString('en-IN', { 
                  day: '2-digit', 
                  month: 'long', 
                  year: 'numeric' 
                })}`, 105, 274, { align: 'center' });
                
                // Save the PDF
                doc.save(`receipt_${selectedPayment.receipt}.pdf`);
              }
            }}
            variant="contained"
            startIcon={<DownloadIcon />}
          >
            Download PDF
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
