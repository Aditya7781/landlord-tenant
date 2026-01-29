'use client';

import React from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Button,
  Chip,
} from '@mui/material';
import {
  Info as InfoIcon,
  Warning as WarningIcon,
  Payment as PaymentIcon,
  CheckCircle as ReadIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

type ApiNotification = {
  SK: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  paymentLink?: string;
};

function formatDate(date: string) {
  return new Date(date).toLocaleString();
}

function getType(n: ApiNotification) {
  if (n.paymentLink) return 'payment';
  if (n.title.toLowerCase().includes('issue')) return 'alert';
  return 'info';
}

export default function UserNotifications() {
  const [notifications, setNotifications] = React.useState<ApiNotification[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // ✅ CORRECT API (no query param)
    fetch('/api/notifications')
      .then(res => res.json())
      .then(data => {
        setNotifications(data.notifications || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography>Loading notifications...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Notifications
          </Typography>
          <Typography color="text.secondary">
            Stay updated with the latest updates
          </Typography>
        </Box>
        <Button startIcon={<ReadIcon />}>Mark all as read</Button>
      </Box>

      <Paper sx={{ borderRadius: 4 }}>
        <List disablePadding>
          <AnimatePresence>
            {notifications.map((notif, index) => {
              const type = getType(notif);

              return (
                <motion.div
                  key={notif.SK}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ListItem
                    sx={{
                      px: 4,
                      py: 3,
                      borderLeft: '4px solid',
                      borderColor:
                        type === 'payment'
                          ? 'success.main'
                          : type === 'alert'
                          ? 'error.main'
                          : 'primary.main',
                    }}
                  >
                    <ListItemIcon>
                      {type === 'payment' ? (
                        <PaymentIcon color="success" />
                      ) : type === 'alert' ? (
                        <WarningIcon color="error" />
                      ) : (
                        <InfoIcon color="primary" />
                      )}
                    </ListItemIcon>

                    <ListItemText
                      primary={
                        <Box component="span" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography component="span" fontWeight={700}>
                            {notif.title}
                          </Typography>
                          <Typography component="span" variant="caption">
                            {formatDate(notif.createdAt)}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography component="span" display="block">
                            {notif.message}
                          </Typography>

                          {notif.paymentLink && (
                            <Box component="span" display="block" mt={1}>
                              <Button
                                size="small"
                                variant="outlined"
                                href={notif.paymentLink}
                                target="_blank"
                              >
                                Pay Now
                              </Button>
                            </Box>
                          )}
                        </>
                      }
                    />

                    {!notif.read && <Chip label="NEW" size="small" />}
                  </ListItem>

                  {index < notifications.length - 1 && <Divider />}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </List>
      </Paper>
    </Box>
  );
}
