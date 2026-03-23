import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import {
  Alert,
  Box,
  Button,
  Link,
  Typography,
} from '@mui/material';
import { User, getAuth, sendEmailVerification, signOut } from 'firebase/auth';

interface VerifyEmailProps {
  user: User | null;
}

const EmailVerificationScreen: React.FC<VerifyEmailProps> = ({ user }) => {
  const navigate = useNavigate();
  const auth = getAuth();
  const [message, setMessage] = useState<string | null>(null);

  const resendVerificationEmail = async () => {
    if (user) {
      await sendEmailVerification(user);
      setMessage('Verification email sent!');
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        width: '100%',
        backgroundColor: '#f9fafb',
      }}>
      <Box
        sx={{
          maxWidth: 400,
          width: '100%',
          mx: 2,
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          backgroundColor: '#ffffff',
          borderRadius: 2,
          border: '1px solid #e5e7eb',
        }}>
        <EmailOutlinedIcon sx={{ fontSize: 48, mb: 2, color: '#6b7280' }} />
        <Typography sx={{ fontSize: '1rem', fontWeight: 600, color: '#111827', mb: 1 }}>
          Verify Your Email
        </Typography>
        <Typography sx={{ fontSize: '0.825rem', color: '#6b7280', textAlign: 'center', mb: 2 }}>
          A verification link has been sent to your email address. Please check your inbox and click the link to proceed.
        </Typography>
        {message && (
          <Alert severity='success' sx={{ mb: 2, width: '100%', fontSize: '0.8rem' }}>
            {message}
          </Alert>
        )}
        <Button
          fullWidth
          onClick={resendVerificationEmail}
          sx={{
            'textTransform': 'none',
            'fontWeight': 600,
            'fontSize': '0.825rem',
            'color': '#ffffff',
            'backgroundColor': '#111827',
            'borderRadius': 1,
            'py': 1,
            '&:hover': { backgroundColor: '#1f2937' },
          }}>
          Resend Verification Email
        </Button>
        <Link
          component='button'
          onClick={handleLogout}
          underline='hover'
          sx={{ mt: 2, fontSize: '0.775rem', color: '#6b7280' }}>
          Logout
        </Link>
      </Box>
    </Box>
  );
};

export default EmailVerificationScreen;
