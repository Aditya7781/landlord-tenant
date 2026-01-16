'use client';

import React, { useState, useEffect } from 'react';
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
    Avatar,
    TextField,
    InputAdornment,
    IconButton,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid
} from '@mui/material';
import {
    Search as SearchIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Hotel as HotelIcon,
    FilterList as FilterIcon
} from '@mui/icons-material';
import { mockApi, User } from '@/services/mockApi';
import { TableSkeleton } from '@/components/shared/SkeletonLoader';

export default function UserManagement() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [open, setOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    useEffect(() => {
        mockApi.getUsers().then(data => {
            setUsers(data);
            setLoading(false);
        });
    }, []);

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleOpenAssign = (user: User) => {
        setSelectedUser(user);
        setOpen(true);
    };

    if (loading) return <Box sx={{ p: 4 }}><TableSkeleton /></Box>;

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800 }}>User Management</Typography>
                    <Typography color="text.secondary">Review applications and manage resident room assignments</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                        size="small"
                        placeholder="Search residents..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
                        sx={{ width: 300 }}
                    />
                    <Button variant="outlined" startIcon={<FilterIcon />} sx={{ borderRadius: 2 }}>Filter</Button>
                </Box>
            </Box>

            <TableContainer component={Paper} sx={{ borderRadius: 4, overflow: 'hidden' }}>
                <Table>
                    <TableHead sx={{ bgcolor: 'action.hover' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 700 }}>Resident</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Allocation</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredUsers.map((user) => (
                            <TableRow key={user.id} hover>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Avatar sx={{ bgcolor: 'primary.main', fontWeight: 700 }}>{user.name[0]}</Avatar>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{user.name}</Typography>
                                    </Box>
                                </TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                    {user.room !== '-' ? (
                                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                                            <Chip label={`R-${user.room}`} size="small" sx={{ fontWeight: 600 }} />
                                            <Chip label={`B-${user.bed}`} size="small" variant="outlined" sx={{ fontWeight: 600 }} />
                                        </Box>
                                    ) : (
                                        <Typography variant="caption" color="text.secondary">Not Assigned</Typography>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={user.status}
                                        size="small"
                                        color={user.status === 'Active' ? 'success' : user.status === 'Pending' ? 'warning' : 'default'}
                                        sx={{ borderRadius: 1.5, fontWeight: 700 }}
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    <IconButton onClick={() => handleOpenAssign(user)} title="Assign Room">
                                        <HotelIcon fontSize="small" color="primary" />
                                    </IconButton>
                                    <IconButton size="small"><EditIcon fontSize="small" /></IconButton>
                                    <IconButton size="small"><DeleteIcon fontSize="small" color="error" /></IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: 4 } }}>
                <DialogTitle sx={{ fontWeight: 800 }}>Assign Room & Bed</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ mb: 4, color: 'text.secondary' }}>
                        Allocating space for <Box component="span" sx={{ color: 'text.primary', fontWeight: 700 }}>{selectedUser?.name}</Box>
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                fullWidth
                                label="Room Number"
                                placeholder="e.g. 204"
                                defaultValue={selectedUser?.room !== '-' ? selectedUser?.room : ''}
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                fullWidth
                                label="Bed Number"
                                placeholder="e.g. B1"
                                defaultValue={selectedUser?.bed !== '-' ? selectedUser?.bed : ''}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 4, pt: 0 }}>
                    <Button onClick={() => setOpen(false)} sx={{ fontWeight: 700 }}>Cancel</Button>
                    <Button variant="contained" onClick={() => setOpen(false)} sx={{ borderRadius: 2, px: 3, fontWeight: 700 }}>
                        Confirm Assignment
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
