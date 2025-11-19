"use client";

import React from "react";
import { Box, CircularProgress, Backdrop } from "@mui/material";

interface LoadingOverlayProps {
  open: boolean;
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  open,
  message,
}) => {
  return (
    <Backdrop
      open={open}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: "rgba(255, 255, 255, 0.7)",
        backdropFilter: "blur(2px)",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
        }}
      >
        <CircularProgress size={48} thickness={4} />
        {message && (
          <Box
            component="span"
            sx={{
              color: "text.primary",
              fontSize: "1rem",
              fontWeight: 500,
            }}
          >
            {message}
          </Box>
        )}
      </Box>
    </Backdrop>
  );
};
