'use client';

import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    TextField,
    Button,
    CircularProgress,
    Alert,
    Autocomplete
} from '@mui/material';
import {
    Send as SendIcon,
    Notifications as NotificationIcon
} from '@mui/icons-material';

const getCookieValue = (name: string): string | null => {
    if (typeof document === "undefined") return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
    return null;
};

interface User {
    firstName: string;
    lastName: string;
    emailAddress: string;
}

interface ApiResponse {
    users: User[];
}

export default function NotificationsPage() {
    const [toEmail, setToEmail] = useState<string>('');
    const [title, setTitle] = useState<string>('');
    const [message, setMessage] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState<User[]>([]);
    const [usersLoading, setUsersLoading] = useState(true);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const token = getCookieValue("session_token");

    useEffect(() => {
        if (!token) return;

        // Fetch users for email autocomplete
        fetch("/api/users", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then((res) => res.json())
            .then((data: ApiResponse) => {
                if (data.users) {
                    setUsers(data.users);
                }
                setUsersLoading(false);
            })
            .catch((err) => {
                console.error("Failed to fetch users:", err);
                setUsersLoading(false);
            });
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!toEmail || !title || !message) {
            setErrorMessage("Please fill all fields");
            return;
        }

        if (!token) {
            setErrorMessage("No authentication token found");
            return;
        }

        setLoading(true);
        setErrorMessage(null);
        setSuccessMessage(null);

        try {
            const response = await fetch("/api/notifications", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    toEmail,
                    title,
                    message,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccessMessage(data.message || "Notification sent successfully!");
                // Reset form
                setToEmail('');
                setTitle('');
                setMessage('');
            } else {
                setErrorMessage(data.message || "Failed to send notification");
            }
        } catch (error) {
            console.error("Send notification error:", error);
            setErrorMessage("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <NotificationIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 800 }}>
                            Send Notification
                        </Typography>
                        <Typography color="text.secondary">
                            Send personalized notifications to residents
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {/* Success/Error Messages */}
            {successMessage && (
                <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage(null)}>
                    {successMessage}
                </Alert>
            )}
            {errorMessage && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setErrorMessage(null)}>
                    {errorMessage}
                </Alert>
            )}

            {/* Form */}
            <Paper sx={{ p: 4, borderRadius: 4 }}>
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12 }}>
                            <Autocomplete
                                freeSolo
                                options={users.map((user) => user.emailAddress)}
                                value={toEmail}
                                onInputChange={(_, newValue) => setToEmail(newValue)}
                                loading={usersLoading}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Recipient Email"
                                        placeholder="Enter email address or select from list"
                                        required
                                        fullWidth
                                        helperText="Type to search or enter email manually"
                                    />
                                )}
                            />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <TextField
                                fullWidth
                                label="Notification Title"
                                placeholder="e.g., Issue on document verification"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                                helperText="Brief subject line for the notification"
                            />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <TextField
                                fullWidth
                                label="Message"
                                placeholder="e.g., Aadhar card not visible"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                required
                                multiline
                                rows={6}
                                helperText="Detailed message content for the notification"
                            />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                                <Button
                                    variant="outlined"
                                    onClick={() => {
                                        setToEmail('');
                                        setTitle('');
                                        setMessage('');
                                        setErrorMessage(null);
                                        setSuccessMessage(null);
                                    }}
                                    disabled={loading}
                                    sx={{ borderRadius: 2 }}
                                >
                                    Clear
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                                    disabled={loading}
                                    sx={{ borderRadius: 2, px: 4 }}
                                >
                                    {loading ? 'Sending...' : 'Send Notification'}
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </form>
            </Paper>

            {/* Info Box */}
            <Paper sx={{ p: 3, mt: 4, borderRadius: 4, bgcolor: 'info.light' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    💡 Notification Guidelines
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    • Notifications are sent instantly to the recipient's email<br />
                    • Use clear and concise titles for better readability<br />
                    • Include all relevant details in the message body<br />
                    • Recipients will receive notifications via email
                </Typography>
            </Paper>
        </Box>
    );
}

