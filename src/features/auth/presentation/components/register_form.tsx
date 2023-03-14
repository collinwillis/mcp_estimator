import { Button, Divider, Stack, TextField, Typography } from "@mui/material";
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";

interface RegisterFormProps {
  setFormValue: (value: number) => void;
}
export default function RegisterForm(props: RegisterFormProps) {
  const [email, setEmail] = React.useState("");
  const navigate = useNavigate();
  const [password, setPassword] = React.useState("");
  const styles = {
    textField: {
      width: "80%",
      backgroundColor: "#f0f4f4",
    },
  };

  const onRegister = () => {
    console.log("login");
    const auth = getAuth();
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user;
        navigate("/");
        // ...
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
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
          sx={styles.textField}
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        ></TextField>
        <TextField
          sx={styles.textField}
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        ></TextField>

        <Button
          sx={{
            width: "80%",
            height: 60,
            fontWeight: "600",
            fontSize: "1rem",
            color: "text.light",
          }}
          variant="contained"
          color="secondary"
          onClick={onRegister}
        >
          Register
        </Button>
        <div style={{ display: "flex", flexDirection: "row" }}>
          <Typography sx={{ fontWeight: "600" }}>OR</Typography>
        </div>

        <Button
          color="primary"
          variant="contained"
          sx={{ width: "50%", height: "50" }}
          onClick={() => props.setFormValue(1)}
        >
          Sign In
        </Button>
      </Stack>
    </>
  );
}
