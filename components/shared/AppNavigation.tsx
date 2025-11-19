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
} from "@mui/material";
import NotesIcon from "@mui/icons-material/Notes";
import FolderIcon from "@mui/icons-material/Folder";
import ChecklistIcon from "@mui/icons-material/Checklist";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import { usePathname, useRouter } from "next/navigation";

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

  const handleNavigation = (path: string) => {
    router.push(path);
    if (variant !== "permanent" && onClose) {
      onClose();
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
