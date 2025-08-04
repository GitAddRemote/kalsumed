import React from 'react';
import { Button, Container, Typography } from '@mui/material';

export default function App() {
  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Welcome to Kalsumed
      </Typography>
      <Button variant="contained" color="primary">
        Let’s get started
      </Button>
    </Container>
  );
}
