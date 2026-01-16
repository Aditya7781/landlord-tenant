'use client';

import React from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Avatar,
    TextField,
    Button,
    Divider,
    Stack,
    IconButton,
    Chip
} from '@mui/material';
import {
    Edit as EditIcon,
    PhotoCamera as CameraIcon,
    Save as SaveIcon,
    Security as SecurityIcon,
    Notifications as NotificationIcon,
    CloudUpload as UploadIcon,
    Description as DocIcon,
    Visibility as ViewIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';

interface ProfileContentProps {
    role: 'admin' | 'user';
}

export default function ProfileContent({ role }: ProfileContentProps) {
    const [isEditing, setIsEditing] = React.useState(false);
    const [formData, setFormData] = React.useState({
        firstName: role === 'admin' ? 'Admin' : 'Sagar',
        lastName: role === 'admin' ? 'User' : 'Kumar',
        email: role === 'admin' ? 'admin@saraswatilodge.com' : 'sagar@test.com',
        phone: '+91 98765 43210',
        address: '123 Main St, Ranchi, Jharkhand',
        fatherName: 'Rajesh Kumar',
        emergencyContact: '+91 88888 77777'
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        setIsEditing(false);
        // In a real app, you would call an API here
        alert('Profile updated successfully!');
    };

    return (
        <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>My Profile</Typography>
            <Typography color="text.secondary" sx={{ mb: 4 }}>
                Manage your personal information and account settings
            </Typography>

            <Grid container spacing={4}>
                {/* Profile Card */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper sx={{ p: 4, borderRadius: 5, textAlign: 'center', height: '100%' }}>
                        <Box sx={{ position: 'relative', display: 'inline-block', mb: 3 }}>
                            <Avatar
                                sx={{
                                    width: 120,
                                    height: 120,
                                    bgcolor: 'primary.main',
                                    fontSize: '3rem',
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                                }}
                            >
                                {role === 'admin' ? 'AD' : 'SR'}
                            </Avatar>
                            <IconButton
                                sx={{
                                    position: 'absolute',
                                    bottom: 0,
                                    right: 0,
                                    bgcolor: 'background.paper',
                                    boxShadow: 2,
                                    '&:hover': { bgcolor: 'action.hover' }
                                }}
                                size="small"
                                component="label"
                            >
                                <CameraIcon fontSize="small" />
                                <input type="file" hidden accept="image/*" />
                            </IconButton>
                        </Box>
                        <Typography variant="h5" sx={{ fontWeight: 700 }}>
                            {formData.firstName} {formData.lastName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            {role === 'admin' ? 'Hazaribagh Headquarters' : 'Room 204, 2nd Floor'}
                        </Typography>
                        <Chip
                            label={role.toUpperCase()}
                            size="small"
                            color={role === 'admin' ? 'secondary' : 'primary'}
                            sx={{ mt: 1, fontWeight: 700, borderRadius: 1.5 }}
                        />

                        <Divider sx={{ my: 4 }} />

                        <Stack spacing={2} sx={{ textAlign: 'left' }}>
                            <Box>
                                <Typography variant="caption" color="text.secondary" display="block">Email Address</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>{formData.email}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary" display="block">Phone Number</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>{formData.phone}</Typography>
                            </Box>
                        </Stack>
                    </Paper>
                </Grid>

                {/* Edit Form */}
                <Grid size={{ xs: 12, md: 8 }}>
                    <Paper sx={{ p: 4, borderRadius: 5 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>Account Details</Typography>
                            {!isEditing && (
                                <Button startIcon={<EditIcon />} size="small" onClick={() => setIsEditing(true)}>Edit Profile</Button>
                            )}
                        </Box>

                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth
                                    label="First Name"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth
                                    label="Last Name"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth
                                    label="Email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth
                                    label="Phone Number"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                />
                            </Grid>
                            {role === 'user' && (
                                <>
                                    <Grid size={{ xs: 12 }}>
                                        <TextField
                                            fullWidth
                                            label="Permanent Address"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            multiline
                                            rows={2}
                                            disabled={!isEditing}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            fullWidth
                                            label="Father's Name"
                                            name="fatherName"
                                            value={formData.fatherName}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            fullWidth
                                            label="Emergency Contact"
                                            name="emergencyContact"
                                            value={formData.emergencyContact}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                        />
                                    </Grid>
                                </>
                            )}
                        </Grid>

                        {isEditing && (
                            <>
                                <Divider sx={{ my: 4 }} />
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                                    <Button variant="outlined" sx={{ borderRadius: 2 }} onClick={() => setIsEditing(false)}>Cancel</Button>
                                    <Button variant="contained" startIcon={<SaveIcon />} sx={{ borderRadius: 2, px: 4 }} onClick={handleSave}>Save Changes</Button>
                                </Box>
                            </>
                        )}
                    </Paper>

                    {/* Security Settings */}
                    <Paper sx={{ p: 4, borderRadius: 5, mt: 4 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Security & Privacy</Typography>
                        <Stack spacing={3}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <SecurityIcon color="action" />
                                    <Box>
                                        <Typography variant="body1" sx={{ fontWeight: 600 }}>Change Password</Typography>
                                        <Typography variant="body2" color="text.secondary">Update your account password regularly</Typography>
                                    </Box>
                                </Box>
                                <Button variant="outlined" size="small">Update</Button>
                            </Box>
                            <Divider />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <NotificationIcon color="action" />
                                    <Box>
                                        <Typography variant="body1" sx={{ fontWeight: 600 }}>Email Notifications</Typography>
                                        <Typography variant="body2" color="text.secondary">Receive monthly bill alerts on email</Typography>
                                    </Box>
                                </Box>
                                <Button variant="text" color="primary">Configure</Button>
                            </Box>
                        </Stack>
                    </Paper>

                    {/* Document Management Section - User Only */}
                    {role === 'user' && (
                        <Paper sx={{ p: 4, borderRadius: 5, mt: 4 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>My Documents (KYC)</Typography>
                                <Button component="label" startIcon={<UploadIcon />} variant="outlined" size="small" sx={{ borderRadius: 2 }}>
                                    Upload New
                                    <input type="file" hidden />
                                </Button>
                            </Box>

                            <Stack spacing={2}>
                                {[
                                    { name: 'Aadhaar Card Front', status: 'Verified', date: 'Oct 12, 2023' },
                                    { name: 'Aadhaar Card Back', status: 'Verified', date: 'Oct 12, 2023' },
                                    { name: 'College ID / Office ID', status: 'Pending', date: 'Oct 14, 2023' },
                                ].map((doc, i) => (
                                    <Paper
                                        key={i}
                                        variant="outlined"
                                        sx={{
                                            p: 2,
                                            borderRadius: 3,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            bgcolor: 'action.hover'
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'primary.light', color: 'white' }}>
                                                <DocIcon fontSize="small" />
                                            </Box>
                                            <Box>
                                                <Typography variant="body2" sx={{ fontWeight: 700 }}>{doc.name}</Typography>
                                                <Typography variant="caption" color="text.secondary">Uploaded on {doc.date}</Typography>
                                            </Box>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Chip
                                                label={doc.status}
                                                size="small"
                                                color={doc.status === 'Verified' ? 'success' : 'warning'}
                                                sx={{ height: 20, fontSize: '0.65rem', fontWeight: 800 }}
                                            />
                                            <IconButton size="small" title="View"><ViewIcon fontSize="small" /></IconButton>
                                            <IconButton size="small" component="label" title="Edit Document">
                                                <EditIcon fontSize="small" color="primary" />
                                                <input type="file" hidden />
                                            </IconButton>
                                            <IconButton size="small" color="error" title="Delete"><DeleteIcon fontSize="small" /></IconButton>
                                        </Box>
                                    </Paper>
                                ))}
                            </Stack>

                            <Box sx={{ mt: 3, p: 2, bgcolor: 'info.main', color: 'white', borderRadius: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box sx={{ fontSize: 24 }}>💡</Box>
                                <Typography variant="caption" sx={{ fontWeight: 500 }}>
                                    Keep your documents updated to ensure uninterrupted access to lodge facilities and valid resident status.
                                </Typography>
                            </Box>
                        </Paper>
                    )}
                </Grid>
            </Grid>
        </Box>
    );
}
