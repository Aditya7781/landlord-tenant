'use client';

import React from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Button,
    TextField,
    Switch,
    FormControlLabel,
    IconButton
} from '@mui/material';
import {
    Save as SaveIcon,
    CloudUpload as UploadIcon,
    NotificationsActive as NotificationIcon,
    SettingsSuggest as ConfigIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';

export default function DashboardConfig() {
    return (
        <Box>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>System Configuration</Typography>
                <Typography color="text.secondary">Customize the dashboard appearance and broadcast global alerts</Typography>
            </Box>

            <Grid container spacing={4}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Paper sx={{ p: 4, borderRadius: 5, height: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                            <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'primary.light', color: 'white' }}>
                                <ConfigIcon />
                            </Box>
                            <Typography variant="h6" sx={{ fontWeight: 800 }}>Banner & Branding</Typography>
                        </Box>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <TextField
                                fullWidth
                                label="Welcome Message"
                                variant="outlined"
                                defaultValue="Welcome to Saraswati Lodge, Hazaribagh"
                            />
                            <TextField
                                fullWidth
                                label="Promotional Subtext"
                                variant="outlined"
                                defaultValue="The most premium stay for students and professionals."
                            />
                            <Box>
                                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>Banner Decoration</Typography>
                                <Button variant="outlined" component="label" fullWidth startIcon={<UploadIcon />} sx={{ py: 2, borderStyle: 'dashed' }}>
                                    Upload New Banner Image
                                    <input type="file" hidden />
                                </Button>
                            </Box>
                            <FormControlLabel
                                control={<Switch defaultChecked color="primary" />}
                                label={<Typography variant="body2" fontWeight={600}>Show Banner on User Dashboard</Typography>}
                            />
                        </Box>

                        <Button
                            variant="contained"
                            startIcon={<SaveIcon />}
                            fullWidth
                            size="large"
                            sx={{ mt: 5, borderRadius: 2, py: 1.5, fontWeight: 800 }}
                        >
                            Update Settings
                        </Button>
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    <Paper sx={{ p: 4, borderRadius: 5, height: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                            <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'secondary.light', color: 'white' }}>
                                <NotificationIcon />
                            </Box>
                            <Typography variant="h6" sx={{ fontWeight: 800 }}>Broadcast Announcement</Typography>
                        </Box>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <TextField
                                fullWidth
                                label="Alert Title"
                                placeholder="e.g. Maintenance Scheduled"
                                variant="outlined"
                            />
                            <TextField
                                fullWidth
                                label="Detailed Message"
                                placeholder="Type your message here..."
                                multiline
                                rows={5}
                                variant="outlined"
                            />
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Button variant="contained" color="secondary" sx={{ borderRadius: 2, flex: 1, fontWeight: 700 }}>
                                    Publish Now
                                </Button>
                                <Button variant="outlined" sx={{ borderRadius: 2, flex: 1, fontWeight: 700 }}>
                                    Save Draft
                                </Button>
                            </Box>
                        </Box>

                        <Box sx={{ mt: 4, p: 2, bgcolor: 'action.hover', borderRadius: 3 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Active Broadcasts</Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>Water supply maintenance... (Oct 10)</Typography>
                                <IconButton size="small"><DeleteIcon fontSize="inherit" color="error" /></IconButton>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}
