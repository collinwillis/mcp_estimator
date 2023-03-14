import { AppBar, Box, dividerClasses, Typography } from "@mui/material";

import React from "react";

interface HeaderProps {
  text: string;
}
export default function Header(props: HeaderProps) {
  return (
    <Box sx={{ textAlign: "center" }}>
      <Typography
        variant="h1"
        sx={{
          fontSize: 40,
          fontWeight: "bold",
          color: "#333333",
        }}
      >
        {props.text}
      </Typography>
    </Box>
  );
}
