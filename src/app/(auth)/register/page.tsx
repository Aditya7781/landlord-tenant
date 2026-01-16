'use client';

import React, { useState } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    Stepper,
    Step,
    StepLabel,
    Paper,
    Grid,
    Checkbox,
    FormControlLabel,
    styled,
    Alert,
    Stack
} from '@mui/material';
import {
    CloudUpload as CloudUploadIcon,
    CheckCircle as CheckCircleIcon,
    NavigateNext as NextIcon,
    NavigateBefore as BackIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import AuthLayout from '@/layouts/AuthLayout';

const steps = ['Personal Information', 'Educational Details', 'Document Upload', 'Declaration'];

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});

export default function RegisterPage() {
    const [activeStep, setActiveStep] = useState(0);
    const [previews, setPreviews] = useState<{ [key: string]: string }>({});
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        fatherName: '',
        motherName: '',
        dob: '',
        address: '',
        email: '',
        contact: '',
        guardianContact: '',
        qualification: '',
        institution: '',
        purpose: '',
        declaration1: false,
        declaration2: false,
        declaration3: false
    });

    const handleNext = () => setActiveStep((prev) => prev + 1);
    const handleBack = () => setActiveStep((prev) => prev - 1);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, docName: string) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                alert('File exceeds maximum size of 10MB');
                return;
            }
            setPreviews(prev => ({ ...prev, [docName]: file.name }));
        }
    };

    const renderPersonalStep = () => (
        <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth label="First Name" name="firstName" value={formData.firstName} onChange={handleInputChange} required placeholder="Sagar" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth label="Last Name" name="lastName" value={formData.lastName} onChange={handleInputChange} required placeholder="Kumar" />
            </Grid>
            <Grid size={{ xs: 12 }}>
                <TextField fullWidth label="Father's Name" name="fatherName" value={formData.fatherName} onChange={handleInputChange} required />
            </Grid>
            <Grid size={{ xs: 12 }}>
                <TextField fullWidth label="Mother's Name" name="motherName" value={formData.motherName} onChange={handleInputChange} required />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth label="Date of Birth" name="dob" type="date" value={formData.dob} onChange={handleInputChange} InputLabelProps={{ shrink: true }} required />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth label="Registration Date" defaultValue={new Date().toISOString().split('T')[0]} disabled sx={{ bgcolor: 'action.hover' }} />
            </Grid>
            <Grid size={{ xs: 12 }}>
                <TextField fullWidth label="Permanent Address" name="address" value={formData.address} onChange={handleInputChange} multiline rows={2} required />
            </Grid>
            <Grid size={{ xs: 12 }}>
                <TextField fullWidth label="Email Address" name="email" value={formData.email} onChange={handleInputChange} type="email" required />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth label="Contact Number" name="contact" value={formData.contact} onChange={handleInputChange} type="tel" required />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth label="Guardian Contact" name="guardianContact" value={formData.guardianContact} onChange={handleInputChange} type="tel" required />
            </Grid>
        </Grid>
    );

    const renderEducationalStep = () => (
        <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
                <TextField fullWidth label="Highest Qualification" name="qualification" value={formData.qualification} onChange={handleInputChange} required />
            </Grid>
            <Grid size={{ xs: 12 }}>
                <TextField fullWidth label="Current Institution/Office" name="institution" value={formData.institution} onChange={handleInputChange} required />
            </Grid>
            <Grid size={{ xs: 12 }}>
                <TextField fullWidth label="Purpose of Living" name="purpose" value={formData.purpose} onChange={handleInputChange} multiline rows={4} required placeholder="e.g. Competitive exam preparation" />
            </Grid>
        </Grid>
    );

    const renderDocumentStep = () => (
        <Grid container spacing={3}>
            {['Aadhaar Card Front', 'Aadhaar Card Back', 'ID Proof', 'Profile Photo'].map((doc) => (
                <Grid size={{ xs: 12, sm: 6 }} key={doc}>
                    <Paper
                        variant="outlined"
                        sx={{
                            p: 3,
                            textAlign: 'center',
                            borderStyle: 'dashed',
                            borderColor: previews[doc] ? 'success.main' : 'divider',
                            bgcolor: previews[doc] ? 'success.900' : 'transparent',
                            transition: 'all 0.3s ease',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center'
                        }}
                    >
                        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 800 }}>{doc}</Typography>
                        <Typography variant="caption" display="block" color="text.secondary" sx={{ mb: 2 }}>
                            PDF, JPG or PNG (Max 10MB)
                        </Typography>

                        {previews[doc] && (
                            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                <CheckCircleIcon color="success" sx={{ fontSize: 16 }} />
                                <Typography variant="body2" color="success.main" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
                                    {previews[doc]}
                                </Typography>
                            </Box>
                        )}

                        <Button
                            component="label"
                            variant={previews[doc] ? "outlined" : "contained"}
                            startIcon={<CloudUploadIcon />}
                            size="small"
                            color={previews[doc] ? "success" : "primary"}
                            sx={{ mt: 'auto', borderRadius: 2 }}
                        >
                            {previews[doc] ? 'Change File' : 'Upload File'}
                            <VisuallyHiddenInput type="file" onChange={(e) => handleFileChange(e, doc)} accept=".pdf,.jpg,.jpeg,.png" />
                        </Button>
                    </Paper>
                </Grid>
            ))}
        </Grid>
    );

    const renderDeclarationStep = () => (
        <Box>
            <Alert severity="info" sx={{ mb: 4, borderRadius: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Terms & Responsibility</Typography>
                Please read and confirm the following declarations carefully to proceed with your application.
            </Alert>
            <Stack spacing={2}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, bgcolor: formData.declaration1 ? 'action.hover' : 'transparent' }}>
                    <FormControlLabel
                        control={<Checkbox name="declaration1" checked={formData.declaration1} onChange={handleInputChange} required />}
                        label={<Typography variant="body2" sx={{ fontWeight: 500 }}>I hereby declare that I have no criminal record or any pending legal cases against me.</Typography>}
                    />
                </Paper>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, bgcolor: formData.declaration2 ? 'action.hover' : 'transparent' }}>
                    <FormControlLabel
                        control={<Checkbox name="declaration2" checked={formData.declaration2} onChange={handleInputChange} required />}
                        label={<Typography variant="body2" sx={{ fontWeight: 500 }}>I agree to abide by all the rules and regulations of Saraswati Lodge, including bill timely payments.</Typography>}
                    />
                </Paper>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, bgcolor: formData.declaration3 ? 'action.hover' : 'transparent' }}>
                    <FormControlLabel
                        control={<Checkbox name="declaration3" checked={formData.declaration3} onChange={handleInputChange} required />}
                        label={<Typography variant="body2" sx={{ fontWeight: 500 }}>I certify that all the information provided above is true and accurate to the best of my knowledge.</Typography>}
                    />
                </Paper>
            </Stack>
        </Box>
    );

    const getStepContent = (step: number) => {
        switch (step) {
            case 0: return renderPersonalStep();
            case 1: return renderEducationalStep();
            case 2: return renderDocumentStep();
            case 3: return renderDeclarationStep();
            default: return 'Unknown step';
        }
    };

    const isStepValid = () => {
        if (activeStep === 0) return formData.firstName && formData.email && formData.contact;
        if (activeStep === 1) return formData.qualification && formData.institution;
        if (activeStep === 3) return formData.declaration1 && formData.declaration2 && formData.declaration3;
        return true;
    };

    return (
        <AuthLayout title="Registration" subtitle="Start your journey with us today">
            <Box sx={{ maxWidth: 900, mx: 'auto' }}>
                <Box sx={{ textAlign: 'center', mb: 6 }}>
                    <Typography variant="h3" sx={{ fontWeight: 900, color: 'text.primary', mb: 1, letterSpacing: -0.5 }}>
                        Join the Lodge
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                        Complete the form below to apply for a resident spot.
                    </Typography>
                </Box>

                <Stepper activeStep={activeStep} sx={{ mb: 6 }} alternativeLabel>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>
                                <Typography variant="caption" sx={{ fontWeight: 700 }}>{label}</Typography>
                            </StepLabel>
                        </Step>
                    ))}
                </Stepper>

                <Paper elevation={0} sx={{ p: { xs: 3, md: 6 }, borderRadius: 5, border: '1px solid', borderColor: 'divider', minHeight: 450, display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ flexGrow: 1 }}>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeStep}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                {getStepContent(activeStep)}
                            </motion.div>
                        </AnimatePresence>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 6, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
                        <Button
                            disabled={activeStep === 0}
                            onClick={handleBack}
                            variant="outlined"
                            startIcon={<BackIcon />}
                            sx={{ borderRadius: 3, px: 3, fontWeight: 700 }}
                        >
                            Previous
                        </Button>
                        <Box>
                            {activeStep === steps.length - 1 ? (
                                <Link href="/login" style={{ textDecoration: 'none' }}>
                                    <Button
                                        variant="contained"
                                        size="large"
                                        disabled={!isStepValid()}
                                        sx={{ borderRadius: 3, px: 5, py: 1.5, fontWeight: 800, boxShadow: '0 8px 16px rgba(99, 102, 241, 0.4)' }}
                                    >
                                        Submit Application
                                    </Button>
                                </Link>
                            ) : (
                                <Button
                                    variant="contained"
                                    onClick={handleNext}
                                    size="large"
                                    disabled={!isStepValid()}
                                    endIcon={<NextIcon />}
                                    sx={{ borderRadius: 3, px: 5, py: 1.5, fontWeight: 800 }}
                                >
                                    Continue
                                </Button>
                            )}
                        </Box>
                    </Box>
                </Paper>

                <Typography variant="body2" sx={{ textAlign: 'center', mt: 5, color: 'text.secondary' }}>
                    Need help? Contact our support at <Link href="#" style={{ color: 'inherit', fontWeight: 600 }}>support@saraswatilodge.com</Link>
                </Typography>
            </Box>
        </AuthLayout>
    );
}
