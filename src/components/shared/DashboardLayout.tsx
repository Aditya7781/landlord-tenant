"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
} from "@mui/material";
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { clearSession, validateSession } from "@/utils/auth-utils";

const drawerWidth = 280;

interface MenuItemType {
  text: string;
  icon: React.ReactNode;
  path: string;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  menuItems: MenuItemType[];
  title: string;
}

export default function DashboardLayout({
  children,
  menuItems,
  title,
}: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"), {
    noSsr: true,
  });

  // ✅ Mobile-only drawer state (NO syncing, NO effects)
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const backGuardRef = React.useRef(false);

  // Validate session on mount
  useEffect(() => {
    if (!validateSession()) {
      router.push("/login");
    }
  }, [router]);

  // Attach popstate listener to prompt logout on dashboard back,
  // or navigate to dashboard from other protected pages.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!validateSession()) return;
    const isDashboard =
      pathname === "/user/dashboard" || pathname === "/admin/dashboard";

    // When on dashboard, push a marker state so back triggers popstate
    if (isDashboard) {
      try {
        window.history.pushState({ dashboardGuard: true }, "", pathname);
      } catch {
        /* ignore */
      }
    }

    const onPopState = (e: PopStateEvent) => {
      if (isDashboard) {
        // ignore immediate consecutive back presses
        if (backGuardRef.current) {
          try {
            window.history.pushState({ dashboardGuard: true }, "", pathname);
          } catch {
            /* ignore */
          }
          return;
        }

        const shouldLogout = window.confirm("Do you want to logout?");
        if (shouldLogout) {
          clearSession();
          router.push("/login");
        } else {
          // keep user on dashboard by restoring our marker state
          try {
            window.history.pushState({ dashboardGuard: true }, "", pathname);
          } catch {
            router.replace(pathname);
          }
          // set short-lived guard to prevent immediate second back
          backGuardRef.current = true;
          window.setTimeout(() => {
            backGuardRef.current = false;
          }, 1500);
        }
        return;
      }

      // Non-dashboard pages: back should take user to their dashboard
      const dashboardPath =
        pathname && pathname.startsWith("/admin")
          ? "/admin/dashboard"
          : "/user/dashboard";
      router.push(dashboardPath);
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [pathname, router]);

  const handleDrawerToggle = () => {
    setOpen((prev) => !prev);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    clearSession();
    router.push("/login");
  };

  /* ---------------- DRAWER CONTENT ---------------- */

  const drawer = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Toolbar
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: [1],
        }}
      >
        <Typography
          variant="h6"
          sx={{ fontWeight: 700, color: "primary.main", ml: 2 }}
        >
          Saraswati Lodge
        </Typography>

        {/* UI SAME — just hide on desktop */}
        {isMobile && (
          <IconButton onClick={handleDrawerToggle}>
            <ChevronLeftIcon />
          </IconButton>
        )}
      </Toolbar>

      <Divider />

      <List sx={{ flexGrow: 1, px: 2, pt: 2 }}>
        {menuItems.map((item) => {
          const isActive = pathname === item.path;

          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => {
                  router.push(item.path);
                  if (isMobile) setOpen(false); // ✅ mobile UX fix
                }}
                sx={{
                  borderRadius: 2,
                  backgroundColor: isActive ? "primary.light" : "transparent",
                  color: isActive ? "primary.contrastText" : "text.primary",
                  "&:hover": {
                    backgroundColor: isActive
                      ? "primary.light"
                      : "action.hover",
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? "inherit" : "primary.main",
                    minWidth: 40,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: isActive ? 600 : 400,
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider />

      <Box sx={{ p: 2 }}>
        <ListItemButton
          onClick={handleLogout}
          sx={{ borderRadius: 2, color: "error.main" }}
        >
          <ListItemIcon sx={{ color: "inherit", minWidth: 40 }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItemButton>
      </Box>
    </Box>
  );

  /* ---------------- LAYOUT ---------------- */

  return (
    <Box
      suppressHydrationWarning
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "background.default",
      }}
    >
      {/* ---------------- APP BAR ---------------- */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          transition: theme.transitions.create(["width", "margin"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          bgcolor: "background.paper",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Toolbar>
          {/* SAME UI — shown only on mobile */}
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerToggle}
              edge="start"
              sx={{ mr: 2, color: "text.primary" }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ flexGrow: 1, color: "text.primary", fontWeight: 600 }}
          >
            {title}
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Tooltip title="Account settings">
              <IconButton onClick={handleMenuOpen} size="small" sx={{ ml: 2 }}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main" }}>
                  AD
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            onClick={handleMenuClose}
            PaperProps={{
              sx: {
                mt: 1.5,
                borderRadius: 2,
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              },
            }}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          >
            <MenuItem
              onClick={() => {
                const profilePath = pathname.startsWith("/admin")
                  ? "/admin/profile"
                  : "/user/profile";
                router.push(profilePath);
              }}
            >
              <ListItemIcon>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              Profile
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* ---------------- DRAWER ---------------- */}
      <Drawer
        variant={isMobile ? "temporary" : "persistent"}
        open={isMobile ? open : true}
        onClose={() => setOpen(false)}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            borderRight: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* ---------------- MAIN ---------------- */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          transition: theme.transitions.create("margin", {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        {/* Persistent title */}
        <Typography
          variant="h6"
          sx={{ mb: 2, color: "text.primary", fontWeight: 600 }}
        >
          {title}
        </Typography>

        {/* Animated page content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </Box>
    </Box>
  );
}
