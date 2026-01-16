'use client';

import React, { useState } from 'react';
import { TextField, Button, Box, Link, InputAdornment, IconButton, Alert } from '@mui/material';
import { Visibility, VisibilityOff, Email } from '@mui/icons-material';
import AuthLayout from '@/layouts/AuthLayout';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData(event.currentTarget);
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        // Mock Login Logic
        if (email === 'admin@lodge.com' && password === 'admin123') {
            document.cookie = 'session_role=admin; path=/';
            router.push('/admin/dashboard');
        } else if (email === 'user@lodge.com' && password === 'user123') {
            document.cookie = 'session_role=user; path=/';
            router.push('/user/dashboard');
        } else {
            setError('Invalid email or password. Hint: admin@lodge.com / admin123');
            setLoading(false);
        }
    };

    return (
        <AuthLayout title="Welcome Back" subtitle="Log in to manage your lodge experience">
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    autoComplete="email"
                    autoFocus
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Email color="action" />
                            </InputAdornment>
                        ),
                    }}
                />
                <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    autoComplete="current-password"
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    aria-label="toggle password visibility"
                                    onClick={() => setShowPassword(!showPassword)}
                                    edge="end"
                                >
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />
                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={loading}
                    sx={{ mt: 3, mb: 2, height: 48 }}
                >
                    {loading ? 'Logging in...' : 'Sign In'}
                </Button>
                <Box sx={{ textAlign: 'center' }}>
                    <Link href="/register" variant="body2" sx={{ fontWeight: 600, textDecoration: 'none' }}>
                        {"Don't have an account? Sign Up"}
                    </Link>
                </Box>
            </Box>
        </AuthLayout>
    );
}
