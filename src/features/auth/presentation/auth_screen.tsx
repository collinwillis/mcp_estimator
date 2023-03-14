import { Box, CssBaseline, Stack, Typography } from "@mui/material";
import { blue } from "@mui/material/colors";
import React, { useState } from "react";
import AuthCard from "./components/auth_card";
import Header from "./components/header";
import LoginForm from "./components/login_form";
import RegisterForm from "./components/register_form";

const styles = {
  root: {
    width: "100vw",
    height: "100vh",
    alignItems: "center",
    justifyContent: "center",
    display: "flex",
  },
};
export default function Welcome() {
  const [formValue, setFormValue] = useState(1);
  return (
    <div style={styles.root}>
      <Typography
        sx={{
          top: "20px",
          position: "absolute",
          left: "20px",
          fontFamily: "nunito",
          fontWeight: "600",
          color: "text.light",
        }}
        variant="h4"
      >
        Estimator
      </Typography>
      <Stack spacing={2}>
        <Header text={formValue === 1 ? "Welcome Back!" : "Welcome!"} />
        <AuthCard>
          {formValue === 2 ? (
            <RegisterForm setFormValue={setFormValue} />
          ) : (
            <LoginForm setFormValue={setFormValue} />
          )}
        </AuthCard>
      </Stack>
    </div>
  );
}
