import React from 'react';

import { AppBar, Box, Typography, dividerClasses } from '@mui/material';

interface HeaderProps {
  text: string;
}
export default function Header(props: HeaderProps) {
  return (
    <Box sx={{ textAlign: 'center' }}>
      <Typography
        variant="h1"
        sx={{
          fontSize: 40,
          fontWeight: 'bold',
          color: '#333333',
        }}
      >
        {props.text}
      </Typography>
    </Box>
  );
}
