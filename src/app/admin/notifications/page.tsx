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
    Autocomplete,
    Card,
    CardContent,
    Divider,
    Chip,
    IconButton,
    Collapse
} from '@mui/material';
import {
    Send as SendIcon,
    Notifications as NotificationIcon,
    History as HistoryIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
    AccessTime as TimeIcon,
    Person as PersonIcon
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

interface NotificationHistory {
    id?: string;
    title?: string;
    message?: string;
    to?: string; // Changed from toEmail to to
    createdAt?: string; // Added createdAt field for date/time
    timestamp?: string;
    date?: string; // Added date field
    time?: string; // Added time field
    status?: string;
}

interface HistoryResponse {
    success: boolean;
    data: NotificationHistory[] | any;
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
    
    // History state
    const [historyData, setHistoryData] = useState<NotificationHistory[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [historyError, setHistoryError] = useState<string | null>(null);
    const [showHistory, setShowHistory] = useState(false);
    const [readMoreValue, setReadMoreValue] = useState<string>('');
    
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

    const fetchNotificationHistory = async (readmore?: string) => {
        if (!token) {
            setHistoryError("No authentication token found");
            return;
        }

        setHistoryLoading(true);
        setHistoryError(null);

        try {
            let url = "/api/notifications/history";
            if (readmore) {
                url += `?readmore=${encodeURIComponent(readmore)}`;
            }

            const response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data: HistoryResponse = await response.json();

            if (data.success && data.data) {
                // Handle different response formats
                const notifications = Array.isArray(data.data) ? data.data : data.data.notifications || [];
                setHistoryData(notifications);
            } else {
                setHistoryError(data.data?.message || "Failed to fetch notification history");
            }
        } catch (error) {
            console.error("Fetch notification history error:", error);
            setHistoryError("Network error. Please try again.");
        } finally {
            setHistoryLoading(false);
        }
    };

    const handleReadMore = () => {
        // Use the last notification's ID or increment readmore value
        const nextReadMore = readMoreValue === '' ? 'MQ==' : btoa((parseInt(atob(readMoreValue)) + 1).toString());
        setReadMoreValue(nextReadMore);
        fetchNotificationHistory(nextReadMore);
    };

    const handleBackToRecent = () => {
        setReadMoreValue('');
        fetchNotificationHistory(); // Fetch without any parameters to get recent notifications
    };

    const toggleHistory = () => {
        if (!showHistory && historyData.length === 0) {
            fetchNotificationHistory();
        }
        setShowHistory(!showHistory);
    };

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

            {/* Notification History Section */}
            <Paper sx={{ mt: 4, borderRadius: 4 }}>
                <Box 
                    sx={{ 
                        p: 3, 
                        cursor: 'pointer', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        '&:hover': { 
                            bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)'
                        }
                    }}
                    onClick={toggleHistory}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <HistoryIcon sx={{ fontSize: 32, color: 'primary.main' }} />
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                Notification History
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                View previously sent notifications
                            </Typography>
                        </Box>
                    </Box>
                    <IconButton>
                        {showHistory ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                </Box>

                <Collapse in={showHistory}>
                    <Divider />
                    <Box sx={{ p: 3 }}>
                        {historyLoading && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                                <CircularProgress />
                            </Box>
                        )}

                        {historyError && (
                            <Alert severity="error" sx={{ mb: 3 }}>
                                {historyError}
                            </Alert>
                        )}

                        {!historyLoading && !historyError && historyData.length === 0 && (
                            <Box sx={{ textAlign: 'center', py: 4 }}>
                                <Typography color="text.secondary">
                                    No notification history found
                                </Typography>
                            </Box>
                        )}

                        {!historyLoading && !historyError && historyData.length > 0 && (
                            <Box>
                                <Grid container spacing={2}>
                                    {historyData.map((notification, index) => (
                                        <Grid size={{ xs: 12, md: 6 }} key={index}>
                                            <Card variant="outlined" sx={{ height: '100%' }}>
                                                <CardContent>
                                                    <Box sx={{ mb: 2 }}>
                                                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                                                            {notification.title || 'No Title'}
                                                        </Typography>
                                                        <Typography 
                                                            variant="body2" 
                                                            color="text.secondary"
                                                            sx={{ 
                                                                mb: 2,
                                                                display: '-webkit-box',
                                                                WebkitLineClamp: 3,
                                                                WebkitBoxOrient: 'vertical',
                                                                overflow: 'hidden'
                                                            }}
                                                        >
                                                            {notification.message || 'No Message'}
                                                        </Typography>
                                                    </Box>

                                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <PersonIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                                            <Typography variant="caption" color="text.secondary">
                                                                {notification.to || 'No recipient'}
                                                            </Typography>
                                                        </Box>
                                                        
                                                        {notification.createdAt && (
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                <TimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                                                <Typography variant="caption" color="text.secondary">
                                                                    {new Date(notification.createdAt).toLocaleString()}
                                                                </Typography>
                                                            </Box>
                                                        )}

                                                        {!notification.createdAt && (notification.date || notification.time) && (
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                <TimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                                                <Typography variant="caption" color="text.secondary">
                                                                    {notification.date && notification.time 
                                                                        ? `${notification.date} ${notification.time}`
                                                                        : notification.timestamp 
                                                                        ? new Date(notification.timestamp).toLocaleString()
                                                                        : 'No timestamp'
                                                                    }
                                                                </Typography>
                                                            </Box>
                                                        )}

                                                        {notification.status && (
                                                            <Chip 
                                                                label={notification.status} 
                                                                size="small" 
                                                                color={notification.status === 'sent' ? 'success' : 'default'}
                                                                sx={{ alignSelf: 'flex-start' }}
                                                            />
                                                        )}
                                                    </Box>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>

                                {/* Navigation Buttons */}
                                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3 }}>
                                    {readMoreValue && (
                                        <Button
                                            variant="outlined"
                                            onClick={handleBackToRecent}
                                            disabled={historyLoading}
                                            startIcon={historyLoading ? <CircularProgress size={16} /> : <ExpandLessIcon />}
                                        >
                                            {historyLoading ? 'Loading...' : 'Back to Recent'}
                                        </Button>
                                    )}
                                    <Button
                                        variant="outlined"
                                        onClick={handleReadMore}
                                        disabled={historyLoading}
                                        startIcon={historyLoading ? <CircularProgress size={16} /> : <ExpandMoreIcon />}
                                    >
                                        {historyLoading ? 'Loading...' : 'Read More'}
                                    </Button>
                                </Box>
                            </Box>
                        )}
                    </Box>
                </Collapse>
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

