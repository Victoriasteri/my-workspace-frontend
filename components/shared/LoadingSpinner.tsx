"use client";

import React from "react";
import { Box, CircularProgress } from "@mui/material";

interface LoadingSpinnerProps {
  size?: number;
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 40,
  message,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        p: 4,
        gap: 2,
      }}
    >
      <CircularProgress size={size} />
      {message && (
        <Box component="span" sx={{ color: "text.secondary" }}>
          {message}
        </Box>
      )}
    </Box>
  );
};
