import {Alert, Button, Stack, TextField, Typography} from "@mui/material";
import {createUserWithEmailAndPassword, getAuth} from "firebase/auth";
import {doc, setDoc} from "firebase/firestore";
import {firestore as db} from "../../../../setup/config/firebase"; // Import your Firestore instance
import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import {UserPermission, UserProfile, UserRole} from "../../../../models/user"; // Import UserProfile model
import {getFirebaseAuthErrorMessage} from "../../../../config/error_handler";

interface RegisterFormProps {
    setFormValue: (value: number) => void;
}

export default function RegisterForm(props: RegisterFormProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const styles = {
        textField: {
            width: "80%",
            backgroundColor: "#f0f4f4",
        },
    };

    const onRegister = async () => {
        setError(null); // Clear any previous errors

        const emailDomain = email.split('@')[1];

        if (emailDomain !== 'indemandis.com' && emailDomain !== 'tidybrackets.com' && emailDomain !== 'outlook.com') {
            setError('Only @indemandis.com email addresses are allowed to register.');
            return;
        }

        const auth = getAuth();
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            const userProfile: UserProfile = {
                uid: user.uid,
                name: fullName,
                email: user.email!,
                permission: UserPermission.READ,
                role: UserRole.USER,
                disabled: false,
                deleted: false,
            };

            await setDoc(doc(db, 'users', user.uid), userProfile);

            navigate("/");
        } catch (error: any) {
            const errorCode = error.code;
            const errorMessage = getFirebaseAuthErrorMessage(errorCode);
            setError(errorMessage);
        }
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
                    placeholder="Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                ></TextField>
                <TextField
                    error={Boolean(error)}
                    sx={styles.textField}
                    placeholder="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                ></TextField>
                <TextField
                    error={Boolean(error)}
                    sx={styles.textField}
                    placeholder="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                ></TextField>

                {error && <Alert severity="error" sx={{width: '80%', mt: 2}}>{error}</Alert>}

                <Button
                    sx={{
                        width: "80%",
                        height: 60,
                        fontWeight: "600",
                        fontSize: "1rem",
                        color: "text.light",
                        mt: error ? 1 : 0
                    }}
                    variant="contained"
                    color="secondary"
                    onClick={onRegister}
                >
                    Register
                </Button>

                <div style={{display: "flex", flexDirection: "row"}}>
                    <Typography sx={{fontWeight: "600"}}>OR</Typography>
                </div>

                <Button
                    color="primary"
                    variant="contained"
                    sx={{width: "50%", height: "50"}}
                    onClick={() => props.setFormValue(1)}
                >
                    Sign In
                </Button>
            </Stack>
        </>
    );
}
