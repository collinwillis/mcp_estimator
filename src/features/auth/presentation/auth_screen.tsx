import React, { useState } from 'react';
import { Box, Stack, Typography } from '@mui/material';

import AuthCard from './components/auth_card';
import Header from './components/header';
import LoginForm from './components/login_form';
import RegisterForm from './components/register_form';

export default function Welcome() {
  const [formValue, setFormValue] = useState(1);
  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f9fafb',
      }}>
      <Typography
        sx={{
          position: 'absolute',
          top: 20,
          left: 24,
          color: '#111827',
          fontWeight: 700,
          fontSize: '0.925rem',
          letterSpacing: '0.04em',
        }}>
        MCP ESTIMATOR
      </Typography>
      <Stack spacing={2}>
        <Header text={formValue === 1 ? 'Welcome Back!' : 'Welcome!'} />
        <AuthCard>
          {formValue === 2 ? (
            <RegisterForm setFormValue={setFormValue} />
          ) : (
            <LoginForm setFormValue={setFormValue} />
          )}
        </AuthCard>
      </Stack>
    </Box>
  );
}
