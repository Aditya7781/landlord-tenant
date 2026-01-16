'use client';

import React from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Grid,
  Card,
  CardContent,
  Stack,
  useTheme,
  Paper
} from '@mui/material';
import {
  Home as HomeIcon,
  Security as SecurityIcon,
  Payments as PaymentIcon,
  ElectricBolt as FastIcon,
  Login as LoginIcon,
  AppRegistration as RegisterIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import Link from 'next/link';

const features = [
  {
    title: 'Smart Allocation',
    description: 'Automated room and bed assignment with real-time occupancy tracking.',
    icon: <HomeIcon sx={{ fontSize: 40 }} />,
    color: '#6366f1'
  },
  {
    title: 'Easy Payments',
    description: 'Pay bills online with UPI, cards, or net banking. Instant receipts.',
    icon: <PaymentIcon sx={{ fontSize: 40 }} />,
    color: '#ec4899'
  },
  {
    title: 'Admin Control',
    description: 'Comprehensive dashboard to manage residents, rooms, and reports.',
    icon: <SecurityIcon sx={{ fontSize: 40 }} />,
    color: '#10b981'
  },
  {
    title: 'Quick Connect',
    description: 'Direct communication channel between residents and management.',
    icon: <FastIcon sx={{ fontSize: 40 }} />,
    color: '#f59e0b'
  }
];

export default function LandingPage() {
  const theme = useTheme();

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Hero Section */}
      <Box
        sx={{
          pt: { xs: 10, md: 15 },
          pb: { xs: 10, md: 20 },
          background: `linear-gradient(135deg, ${theme.palette.primary.main}10 0%, ${theme.palette.secondary.main}10 100%)`,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid size={{ xs: 12, md: 7 }}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <Typography
                  variant="h1"
                  sx={{
                    fontWeight: 900,
                    fontSize: { xs: '2.5rem', md: '4rem' },
                    lineHeight: 1.1,
                    mb: 2,
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Premium Living,<br />Simplified.
                </Typography>
                <Typography variant="h5" color="text.secondary" sx={{ mb: 5, maxWidth: 600, fontWeight: 500 }}>
                  Saraswati Lodge offers the most comfortable and managed stay in Hazaribagh. Experience luxury with a touch of discipline.
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Link href="/login" style={{ textDecoration: 'none' }}>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<LoginIcon />}
                      sx={{
                        px: 4,
                        py: 2,
                        borderRadius: 3,
                        fontWeight: 800,
                        boxShadow: '0 10px 20px rgba(99, 102, 241, 0.3)'
                      }}
                    >
                      Resident Login
                    </Button>
                  </Link>
                  <Link href="/register" style={{ textDecoration: 'none' }}>
                    <Button
                      variant="outlined"
                      size="large"
                      startIcon={<RegisterIcon />}
                      sx={{
                        px: 4,
                        py: 2,
                        borderRadius: 3,
                        fontWeight: 800,
                        borderWidth: 2,
                        '&:hover': { borderWidth: 2 }
                      }}
                    >
                      Join Now
                    </Button>
                  </Link>
                </Stack>
              </motion.div>
            </Grid>
            <Grid size={{ xs: 12, md: 5 }} sx={{ display: { xs: 'none', md: 'block' } }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.2 }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    borderRadius: 6,
                    bgcolor: 'background.paper',
                    boxShadow: '0 50px 100px -20px rgba(0,0,0,0.12)',
                    border: '1px solid',
                    borderColor: 'divider',
                    position: 'relative',
                    zIndex: 1
                  }}
                >
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>
                      Live Status
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800 }}>95% Occupied</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                      <Box key={i} sx={{ flex: 1, height: 8, borderRadius: 4, bgcolor: i < 7 ? 'success.main' : 'action.hover' }} />
                    ))}
                  </Box>
                  <Typography variant="caption" color="text.secondary">Only a few beds remaining in 2nd Floor</Typography>
                </Paper>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 15 }}>
        <Box sx={{ textAlign: 'center', mb: 10 }}>
          <Typography variant="h3" sx={{ fontWeight: 900, mb: 2 }}>Why Choose Us?</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
            We provide more than just a room. We provide a productive environment for your growth.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
              <motion.div
                whileHover={{ y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <Card sx={{ height: '100%', borderRadius: 5, border: '1px solid transparent', '&:hover': { borderColor: feature.color, boxShadow: `0 20px 40px -10px ${feature.color}20` } }}>
                  <CardContent sx={{ p: 4, textAlign: 'center' }}>
                    <Box sx={{ mb: 3, display: 'inline-flex', p: 2, borderRadius: 3, bgcolor: `${feature.color}15`, color: feature.color }}>
                      {feature.icon}
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>{feature.title}</Typography>
                    <Typography variant="body2" color="text.secondary">{feature.description}</Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Footer */}
      <Box sx={{ py: 6, borderTop: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} Saraswati Lodge. Managed by HZB Solutions.
        </Typography>
      </Box>
    </Box>
  );
}
