"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Snackbar,
  IconButton,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Send as SendIcon,
  Campaign as CampaignIcon,
  Clear as ClearIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { motion } from 'framer-motion';

const getCookieValue = (name: string): string | null => {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
};

interface AnnouncementForm {
  title: string;
  message: string;
}

interface Announcement {
  id?: string;
  title: string;
  message: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function AnnouncementManagement() {
  const [formData, setFormData] = useState<AnnouncementForm>({
    title: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });
  
  // State for announcements list
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(true);
  const [announcementsError, setAnnouncementsError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [announcementToDelete, setAnnouncementToDelete] = useState<Announcement | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  const token = getCookieValue("session_token");

  // Fetch announcements on component mount
  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '—';
    try {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch {
        return '—';
    }
  };

  const fetchAnnouncements = async () => {
    if (!token) {
      setAnnouncementsError("No authentication token found");
      setAnnouncementsLoading(false);
      return;
    }

    setAnnouncementsLoading(true);
    setAnnouncementsError(null);
    
    try {
      const response = await fetch("/api/announcements", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();
      
      if (response.ok) {
        setAnnouncements(result.announcements || []);
      } else {
        setAnnouncementsError(result.message || "Failed to fetch announcements");
      }
    } catch (error) {
      console.error("Fetch announcements error:", error);
      setAnnouncementsError("Network error. Please try again.");
    } finally {
      setAnnouncementsLoading(false);
    }
  };

  const handleDeleteAnnouncement = (announcement: Announcement) => {
    setAnnouncementToDelete(announcement);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteAnnouncement = async () => {
    if (!announcementToDelete || !token) return;

    setDeleteLoading(true);
    
    try {
      const response = await fetch("/api/admin/announcements", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: announcementToDelete.id,
        }),
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        setSnackbar({
          open: true,
          message: "Announcement deleted successfully!",
          severity: "success",
        });
        // Refresh announcements list
        fetchAnnouncements();
      } else {
        setSnackbar({
          open: true,
          message: result.message || "Failed to delete announcement",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Delete announcement error:", error);
      setSnackbar({
        open: true,
        message: "Network error. Please try again.",
        severity: "error",
      });
    } finally {
      setDeleteLoading(false);
      setDeleteDialogOpen(false);
      setAnnouncementToDelete(null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.message.trim()) {
      setError("Please fill in both title and message fields");
      return;
    }

    const token = getCookieValue("session_token");
    if (!token) {
      setError("No authentication token found");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          message: formData.message.trim(),
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSuccess(true);
        setFormData({ title: "", message: "" });
        setSnackbar({
          open: true,
          message: "Announcement created successfully!",
          severity: "success",
        });
        // Refresh announcements list after creating new one
        fetchAnnouncements();
      } else {
        setError(result.message || "Failed to create announcement");
        setSnackbar({
          open: true,
          message: result.message || "Failed to create announcement",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Announcement creation error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      setError(errorMessage);
      setSnackbar({
        open: true,
        message: errorMessage || "Network error. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFormData({ title: "", message: "" });
    setError(null);
    setSuccess(false);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 600, color: "primary.main" }}>
        <CampaignIcon sx={{ mr: 2, verticalAlign: "middle" }} />
        Announcement Management
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Create New Announcement
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 3 }}>
                Announcement created successfully!
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Announcement Title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                disabled={loading}
                sx={{ mb: 3 }}
                placeholder="Enter announcement title..."
                inputProps={{ maxLength: 200 }}
                helperText={`${formData.title.length}/200 characters`}
              />

              <TextField
                fullWidth
                label="Announcement Message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                required
                disabled={loading}
                multiline
                rows={6}
                sx={{ mb: 3 }}
                placeholder="Enter your announcement message..."
                inputProps={{ maxLength: 1000 }}
                helperText={`${formData.message.length}/1000 characters`}
              />

              <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                <Button
                  variant="outlined"
                  startIcon={<ClearIcon />}
                  onClick={handleClear}
                  disabled={loading}
                >
                  Clear
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
                  disabled={loading || !formData.title.trim() || !formData.message.trim()}
                  sx={{ minWidth: 120 }}
                >
                  {loading ? "Creating..." : "Send Announcement"}
                </Button>
              </Box>
            </form>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Guidelines
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                • Title should be concise and descriptive
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                • Message should provide clear information
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                • Maximum title length: 200 characters
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                • Maximum message length: 1000 characters
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                • Announcements will be sent to all users
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Recent Activity
                </Typography>
                <IconButton 
                  size="small" 
                  onClick={fetchAnnouncements}
                  disabled={announcementsLoading}
                  title="Refresh"
                >
                  <RefreshIcon fontSize="small" />
                </IconButton>
              </Box>
              
              {announcementsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                  <CircularProgress size={20} />
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    Loading announcements...
                  </Typography>
                </Box>
              ) : announcementsError ? (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {announcementsError}
                </Alert>
              ) : announcements.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No announcements created yet. Use the form to create your first announcement.
                </Typography>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {announcements.slice(0, 10).map((announcement, index) => (
                    <motion.div
                      key={announcement.id || index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Paper 
                        variant="outlined" 
                        sx={{ 
                          p: 2, 
                          borderLeft: 3, 
                          borderLeftColor: 'primary.main',
                          '&:hover': {
                            bgcolor: 'action.hover',
                            transition: 'bgcolor 0.2s'
                          }
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                              {announcement.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              {announcement.message.length > 150 
                                ? `${announcement.message.substring(0, 150)}...` 
                                : announcement.message
                              }
                            </Typography>
                            {announcement.createdAt && (
                              <Typography variant="caption" color="text.secondary">
                                {formatDate(announcement.createdAt)}
                              </Typography>
                            )}
                          </Box>
                          <IconButton 
                            size="small" 
                            onClick={() => handleDeleteAnnouncement(announcement)}
                            title="Delete announcement"
                            sx={{ ml: 1 }}
                          >
                            <DeleteIcon fontSize="small" color="error" />
                          </IconButton>
                        </Box>
                      </Paper>
                    </motion.div>
                  ))}
                  {announcements.length > 10 && (
                    <Typography variant="body2" color="primary" sx={{ textAlign: 'center', mt: 1 }}>
                      +{announcements.length - 10} more announcements
                    </Typography>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          Delete Announcement
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Are you sure you want to delete this announcement?
          </Typography>
          {announcementToDelete && (
            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                {announcementToDelete.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {announcementToDelete.message.length > 100 
                  ? `${announcementToDelete.message.substring(0, 100)}...` 
                  : announcementToDelete.message
                }
              </Typography>
            </Paper>
          )}
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            disabled={deleteLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={confirmDeleteAnnouncement}
            variant="contained"
            color="error"
            disabled={deleteLoading}
            startIcon={deleteLoading ? <CircularProgress size={16} /> : <DeleteIcon />}
          >
            {deleteLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
