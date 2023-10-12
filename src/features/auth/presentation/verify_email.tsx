import React, {useState} from 'react';
import {Alert, Box, Button, Container, Link, Paper, Typography} from '@mui/material';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import {getAuth, sendEmailVerification, signOut, User} from "firebase/auth";
import {useNavigate} from 'react-router-dom';

interface VerifyEmailProps {
    user: User | null;
}

const EmailVerificationScreen: React.FC<VerifyEmailProps> = ({user}) => {
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
                width: '100%'
            }}
        >
            <Container component={Paper} maxWidth="xs" elevation={3}
                       sx={{p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                <EmailOutlinedIcon sx={{fontSize: 80, mb: 2}} color="primary"/>
                <Typography variant="h5" gutterBottom>
                    Verify Your Email
                </Typography>
                <Typography variant="body1" align="center" gutterBottom>
                    A verification link has been sent to your email address. Please check your inbox and click the link
                    to
                    proceed.
                </Typography>
                {message && <Alert severity="success" sx={{mt: 2, width: '100%'}}>{message}</Alert>}
                <Box sx={{mt: 3, width: '100%'}}>
                    <Button
                        color="primary"
                        variant="contained"
                        fullWidth
                        onClick={resendVerificationEmail}
                    >
                        Resend Verification Email
                    </Button>
                    <Link
                        component="button"
                        variant="body2"
                        onClick={handleLogout}
                        underline="hover"
                        align="center"
                        sx={{mt: 2, display: 'inline-block', width: '100%', textAlign: 'center'}}
                    >
                        Logout
                    </Link>
                </Box>
            </Container>
        </Box>
    );
};

export default EmailVerificationScreen;
