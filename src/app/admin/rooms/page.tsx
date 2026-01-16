'use client';

import React from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    LinearProgress,
    Chip,
    Button,
    IconButton,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    KingBed as BedIcon
} from '@mui/icons-material';
import { mockApi, Room } from '@/services/mockApi';
import { TableSkeleton } from '@/components/shared/SkeletonLoader';

export default function RoomManagement() {
    const [rooms, setRooms] = React.useState<Room[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        mockApi.getRooms().then(data => {
            setRooms(data);
            setLoading(false);
        });
    }, []);

    if (loading) return (
        <Box sx={{ p: 4 }}>
            <TableSkeleton />
        </Box>
    );

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800 }}>Room Management</Typography>
                    <Typography color="text.secondary">Manage floor-wise room inventory and bed availability</Typography>
                </Box>
                <Button variant="contained" startIcon={<AddIcon />} sx={{ borderRadius: 2 }}>
                    Add New Room
                </Button>
            </Box>

            <Grid container spacing={3}>
                {rooms.map((room) => {
                    const occupancy = (room.occupiedBeds / room.totalBeds) * 100;
                    return (
                        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={room.id}>
                            <Card sx={{ borderRadius: 4, height: '100%', transition: 'all 0.3s', '&:hover': { boxShadow: 6, transform: 'translateY(-4px)' } }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                        <Box>
                                            <Typography variant="h5" sx={{ fontWeight: 700 }}>Room {room.number}</Typography>
                                            <Chip
                                                label={occupancy === 100 ? 'Full' : occupancy === 0 ? 'Empty' : 'Available'}
                                                size="small"
                                                color={occupancy === 100 ? 'error' : occupancy === 0 ? 'success' : 'warning'}
                                                sx={{ mt: 1, borderRadius: 1.5, fontWeight: 600 }}
                                            />
                                        </Box>
                                        <Box>
                                            <IconButton size="small"><EditIcon fontSize="small" /></IconButton>
                                            <IconButton size="small"><DeleteIcon fontSize="small" color="error" /></IconButton>
                                        </Box>
                                    </Box>

                                    <Box sx={{ mb: 3 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant="body2" color="text.secondary">Occupancy</Typography>
                                            <Typography variant="body2" fontWeight={600}>{room.occupiedBeds}/{room.totalBeds} Beds</Typography>
                                        </Box>
                                        <LinearProgress
                                            variant="determinate"
                                            value={occupancy}
                                            sx={{ height: 8, borderRadius: 4, bgcolor: 'action.hover' }}
                                        />
                                    </Box>

                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <BedIcon color="action" />
                                        <Typography variant="body2" color="text.secondary">
                                            {room.totalBeds - room.occupiedBeds} beds currently vacant
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    );
                })}
            </Grid>
        </Box>
    );
}
