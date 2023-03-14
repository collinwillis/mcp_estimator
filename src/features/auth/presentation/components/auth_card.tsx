import Paper from "@mui/material/Box";
import React from "react";

interface AuthCardProps {
  children: React.ReactNode;
}
export default function AuthCard(props: AuthCardProps) {
  const styles = {
    paper: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      paddingTop: "20px",
      backgroundColor: "#FBFBFB",
      width: "40vw",
      maxWidth: "450px",
      minWidth: "300px",
      borderRadius: "10px",
    },
  };
  return <Paper sx={styles.paper}>{props.children}</Paper>;
}
