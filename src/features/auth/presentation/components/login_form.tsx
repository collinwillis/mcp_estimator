import { Button, Divider, Stack, TextField, Typography } from "@mui/material";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import React from "react";
import { useNavigate } from "react-router-dom";

interface LoginFormProps {
  setFormValue: (value: number) => void;
}
const LoginForm = (props: LoginFormProps) => {
  const navigate = useNavigate();
  const [userName, setUserName] = React.useState("");
  const [password, setPassword] = React.useState("");

  const onLogin = () => {
    console.log("login");
    const auth = getAuth();
    signInWithEmailAndPassword(auth, userName, password)
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
  const styles = {
    textField: {
      width: "80%",
      backgroundColor: "#f0f4f4",
    },
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
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
        >
          {" "}
        </TextField>
        <TextField
          sx={styles.textField}
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        >
          {" "}
        </TextField>
        <Button
          sx={{
            width: "80%",
            height: 60,
            fontWeight: "600",
            fontSize: "1rem",
          }}
          variant="contained"
          color="primary"
          onClick={onLogin}
        >
          Login
        </Button>
        <div style={{ display: "flex", flexDirection: "row" }}>
          <Typography sx={{ fontWeight: "600" }}>OR</Typography>
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
