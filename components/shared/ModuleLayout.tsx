"use client";

import React from "react";
import { Box, AppBar, Toolbar, Typography, IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { AppNavigation } from "./AppNavigation";
import { NotificationSnackbar } from "./NotificationSnackbar";

const DRAWER_WIDTH = 240;

interface NotificationState {
  open: boolean;
  message: string;
  severity: "success" | "error" | "warning" | "info";
}

interface ModuleLayoutProps {
  children: React.ReactNode;
  title: string;
  actionButton?: React.ReactNode;
  notification?: NotificationState;
  onNotificationClose?: () => void;
}

export const ModuleLayout: React.FC<ModuleLayoutProps> = ({
  children,
  title,
  actionButton,
  notification,
  onNotificationClose,
}) => {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { sm: `${DRAWER_WIDTH}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
          {actionButton}
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: DRAWER_WIDTH }, flexShrink: { sm: 0 } }}
      >
        <AppNavigation
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
        />
        <AppNavigation variant="permanent" />
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: 8,
        }}
      >
        {children}
      </Box>
      {notification && onNotificationClose && (
        <NotificationSnackbar
          open={notification.open}
          message={notification.message}
          severity={notification.severity}
          onClose={onNotificationClose}
        />
      )}
    </Box>
  );
};
