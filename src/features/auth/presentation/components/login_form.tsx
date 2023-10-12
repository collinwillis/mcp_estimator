import {Alert, Button, Link, Stack, TextField, Typography} from "@mui/material";
import {getAuth, sendPasswordResetEmail, signInWithEmailAndPassword} from "firebase/auth";
import {collection, getDocs, query, where} from "firebase/firestore";
import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import {getFirebaseAuthErrorMessage} from "../../../../config/error_handler";
import {firestore as db} from "../../../../setup/config/firebase";

interface LoginFormProps {
    setFormValue: (value: number) => void;
}

const LoginForm = (props: LoginFormProps) => {
    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const navigate = useNavigate();

    const styles = {
        textField: {
            width: "80%",
            backgroundColor: "#f0f4f4",
        },
    };

    const onLogin = () => {
        setError(null);
        const auth = getAuth();
        signInWithEmailAndPassword(auth, userName, password)
            .then(async (userCredential) => {
                // Check if the user is disabled or deleted
                const usersCol = collection(db, 'users');
                const q = query(usersCol, where('email', '==', userName));
                const userSnapshot = await getDocs(q);

                if (!userSnapshot.empty) {
                    const userData = userSnapshot.docs[0].data();

                    if (userData.disabled) {
                        setError('This account has been disabled.');
                        return;
                    }

                    if (userData.deleted) {
                        setError('This account does not exist.');
                        return;
                    }

                    navigate("/");
                } else {
                    setError('User data not found.');
                }
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = getFirebaseAuthErrorMessage(errorCode);
                setError(errorMessage);
            });
    };

    const sendResetEmail = () => {
        if (!userName.trim()) {
            setError('Please enter your email address first.');
            return;
        }

        const auth = getAuth();
        sendPasswordResetEmail(auth, userName)
            .then(() => {
                setMessage("Password reset email sent! Check your inbox.");
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = getFirebaseAuthErrorMessage(errorCode);
                setError(errorMessage);
            });
    };

    return (
        <>
            <Stack
                spacing={2.5}
                alignItems={"center"}
                justifyContent={"center"}
                width={"100%"}
                height={"100%"}
                p={"20px"}
            >
                <TextField
                    error={Boolean(error)}
                    sx={styles.textField}
                    placeholder="email"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                />
                <TextField
                    error={Boolean(error)}
                    sx={styles.textField}
                    placeholder="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                {error && <Alert severity="error" sx={{width: '80%', mt: 2}}>{error}</Alert>}
                {message && <Alert severity="success" sx={{width: '80%', mt: 2}}>{message}</Alert>}

                <Button
                    sx={{
                        width: "80%",
                        height: 60,
                        fontWeight: "600",
                        fontSize: "1rem",
                        mt: error || message ? 1 : 0
                    }}
                    variant="contained"
                    color="primary"
                    onClick={onLogin}
                >
                    Login
                </Button>
                <Link
                    component="button"
                    variant="body2"
                    underline="hover"
                    sx={{mt: 2}}
                    onClick={sendResetEmail}
                >
                    Forgot password?
                </Link>

                <div style={{display: "flex", flexDirection: "row"}}>
                    <Typography sx={{fontWeight: "600"}}>OR</Typography>
                </div>

                <Button
                    variant="contained"
                    color="secondary"
                    sx={{
                        width: "50%",
                        height: "50",
                        fontWeight: "600",
                    }}
                    onClick={() => props.setFormValue(2)}
                >
                    Register
                </Button>
            </Stack>
        </>
    );
};

export default LoginForm;
