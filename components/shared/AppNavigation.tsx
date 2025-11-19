"use client";

import React from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Box,
  Typography,
  Divider,
} from "@mui/material";
import NotesIcon from "@mui/icons-material/Notes";
import FolderIcon from "@mui/icons-material/Folder";
import ChecklistIcon from "@mui/icons-material/Checklist";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import LogoutIcon from "@mui/icons-material/Logout";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const DRAWER_WIDTH = 240;

interface Module {
  id: string;
  name: string;
  path: string;
  icon: React.ReactNode;
}

const modules: Module[] = [
  {
    id: "notes",
    name: "My Notes",
    path: "/notes",
    icon: <NotesIcon />,
  },
  {
    id: "files",
    name: "My Files",
    path: "/files",
    icon: <FolderIcon />,
  },
  {
    id: "todos",
    name: "My TODOs",
    path: "/todos",
    icon: <ChecklistIcon />,
  },
  {
    id: "gallery",
    name: "My Gallery",
    path: "/gallery",
    icon: <PhotoLibraryIcon />,
  },
];

interface AppNavigationProps {
  open?: boolean;
  onClose?: () => void;
  variant?: "permanent" | "persistent" | "temporary";
}

export const AppNavigation: React.FC<AppNavigationProps> = ({
  open = true,
  onClose,
  variant = "permanent",
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleNavigation = (path: string) => {
    router.push(path);
    if (variant !== "permanent" && onClose) {
      onClose();
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
      if (variant !== "permanent" && onClose) {
        onClose();
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const drawerContent = (
    <>
      <Toolbar>
        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{ fontWeight: 600 }}
        >
          My Work Space
        </Typography>
      </Toolbar>
      {user && (
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="body2" color="text.secondary" noWrap>
            {user.firstName} {user.lastName}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {user.email}
          </Typography>
        </Box>
      )}
      <Divider />
      <List>
        {modules.map((module) => {
          const isActive =
            pathname === module.path || pathname?.startsWith(`${module.path}/`);
          return (
            <ListItem key={module.id} disablePadding>
              <ListItemButton
                selected={isActive}
                onClick={() => handleNavigation(module.path)}
                sx={{
                  "&.Mui-selected": {
                    backgroundColor: "primary.main",
                    color: "primary.contrastText",
                    "&:hover": {
                      backgroundColor: "primary.dark",
                    },
                    "& .MuiListItemIcon-root": {
                      color: "primary.contrastText",
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? "primary.contrastText" : "inherit",
                  }}
                >
                  {module.icon}
                </ListItemIcon>
                <ListItemText primary={module.name} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </>
  );

  if (variant === "permanent") {
    return (
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
          },
        }}
      >
        {drawerContent}
      </Drawer>
    );
  }

  return (
    <Drawer
      variant={variant}
      open={open}
      onClose={onClose}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile.
      }}
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: DRAWER_WIDTH,
          boxSizing: "border-box",
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};
