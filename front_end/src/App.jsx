import React, { useState, lazy, Suspense, useEffect } from "react";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Stack,
  CircularProgress,
  Avatar,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Badge,
  Chip,
  useTheme,
  useMediaQuery,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
} from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { motion, AnimatePresence } from "framer-motion";
import DashboardIcon from "@mui/icons-material/Dashboard";
import SchoolIcon from "@mui/icons-material/School";
import FlagIcon from "@mui/icons-material/Flag";
import FeedbackIcon from "@mui/icons-material/Feedback";
import ExtensionIcon from "@mui/icons-material/Extension";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SettingsIcon from "@mui/icons-material/Settings";
import PersonIcon from "@mui/icons-material/Person";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AuthForm from "./components/AuthForm";

// ========== ENHANCED THEME ==========
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { 
      main: "#1565c0",
      light: "#42a5f5",
      dark: "#0d47a1",
    },
    secondary: { 
      main: "#ff4081",
      light: "#ff79b0",
      dark: "#c60055",
    },
    background: { 
      default: "#f8fafc",
      paper: "#ffffff",
    },
    success: {
      main: "#4caf50",
      light: "#81c784",
    },
    warning: {
      main: "#ff9800",
      light: "#ffb74d",
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 700, letterSpacing: "-0.02em" },
    h5: { fontWeight: 600, letterSpacing: "-0.01em" },
    h6: { fontWeight: 500 },
    button: { 
      textTransform: "none", 
      fontWeight: 600,
      borderRadius: 8,
    },
    body1: { lineHeight: 1.6 },
    body2: { lineHeight: 1.5 },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: "10px 24px",
        },
      },
    },
  },
});

// ========== OPTIMIZED FEATURES CONFIG ==========
const FEATURES = [
  { 
    key: "dashboard", 
    label: "Dashboard", 
    icon: <DashboardIcon />, 
    component: lazy(() => import("./components/Dashboard")),
    description: "Tổng quan học tập & phân tích kỹ năng",
    color: "#1565c0",
    gradient: "linear-gradient(135deg, #1565c0, #42a5f5)",
  },
  { 
    key: "goal", 
    label: "Mục tiêu học tập", 
    icon: <FlagIcon />, 
    component: lazy(() => import("./components/GoalForm")),
    description: "Thiết lập & theo dõi mục tiêu",
    color: "#4caf50",
    gradient: "linear-gradient(135deg, #4caf50, #81c784)",
  },
  { 
    key: "external", 
    label: "Khóa học", 
    icon: <ExtensionIcon />, 
    component: lazy(() => import("./components/ExternalCourses")),
    description: "Khám phá khóa học bên ngoài",
    color: "#ff9800",
    gradient: "linear-gradient(135deg, #ff9800, #ffb74d)",
  },
  { 
    key: "feedback", 
    label: "Phản hồi & Đánh giá", 
    icon: <FeedbackIcon />, 
    component: lazy(() => import("./components/FeedbackForm")),
    description: "Đóng góp ý kiến cải thiện",
    color: "#9c27b0",
    gradient: "linear-gradient(135deg, #9c27b0, #ba68c8)",
  },
];

// ========== LOADING COMPONENT ==========
const LoadingScreen = () => (
  <Box 
    sx={{ 
      display: "flex", 
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center", 
      height: "50vh",
      gap: 3,
    }}
  >
    <motion.div
      animate={{ 
        scale: [1, 1.2, 1],
        rotate: [0, 180, 360]
      }}
      transition={{ 
        duration: 2, 
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <CircularProgress 
        size={60} 
        thickness={4}
        sx={{
          color: theme.palette.primary.main,
          filter: "drop-shadow(0 4px 8px rgba(21, 101, 192, 0.3))"
        }}
      />
    </motion.div>
    <Typography 
      variant="h6" 
      sx={{ 
        color: "text.secondary",
        fontWeight: 500,
      }}
    >
      Đang tải...
    </Typography>
  </Box>
);

// ========== MAIN APP COMPONENT ==========
export default function App() {
  const appTheme = useTheme();
  const isMobile = useMediaQuery(appTheme.breakpoints.down("md"));
  
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [user, setUser] = useState(
    localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null
  );
  const [selected, setSelected] = useState("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications] = useState(3); // Mock notification count

  const handleLoginSuccess = (token, userInfo) => {
    setToken(token);
    setUser(userInfo);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userInfo));
    if (userInfo?.id) localStorage.setItem("user_id", userInfo.id);
    setSelected("dashboard");
  };

  const handleLogout = () => {
    setToken("");
    setUser(null);
    setSelected("dashboard");
    localStorage.clear();
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const userId = user?.id || localStorage.getItem("user_id");
  const currentFeature = FEATURES.find((f) => f.key === selected);

  // ========== SIDEBAR CONTENT ==========
  const sidebarContent = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Logo & Brand */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Toolbar sx={{ py: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                background: "linear-gradient(135deg, #42a5f5, #1976d2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: 700,
                fontSize: "1.2rem",
              }}
            >
              P
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: "white" }}>
              Pathwise
            </Typography>
          </Box>
        </Toolbar>
      </motion.div>

      <Divider sx={{ bgcolor: "rgba(255,255,255,0.15)" }} />

      {/* User Profile */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Box sx={{ p: 3, textAlign: "center" }}>
          <Avatar 
            sx={{ 
              bgcolor: "rgba(255,255,255,0.2)", 
              width: 64, 
              height: 64, 
              mx: "auto", 
              mb: 2,
              border: "3px solid rgba(255,255,255,0.3)",
              fontSize: "1.5rem",
              fontWeight: 700,
            }}
          >
            {user?.full_name?.[0]?.toUpperCase() || "U"}
          </Avatar>
          <Typography variant="h6" sx={{ color: "white", mb: 0.5 }}>
            {user?.full_name || "Người dùng"}
          </Typography>
          <Chip 
            label="Learning Explorer" 
            size="small"
            sx={{ 
              bgcolor: "rgba(255,255,255,0.2)", 
              color: "white",
              fontSize: "0.75rem",
            }} 
          />
        </Box>
      </motion.div>

      <Divider sx={{ bgcolor: "rgba(255,255,255,0.15)" }} />

      {/* Navigation */}
      <Box sx={{ flexGrow: 1, py: 2 }}>
        <List sx={{ px: 2 }}>
          {FEATURES.map((feature, index) => (
            <motion.div
              key={feature.key}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
            >
              <Tooltip title={feature.description} placement="right" arrow>
                <ListItem
                  button
                  onClick={() => {
                    setSelected(feature.key);
                    if (isMobile) setMobileOpen(false);
                  }}
                  sx={{
                    background: selected === feature.key 
                      ? "rgba(255,255,255,0.15)" 
                      : "transparent",
                    borderRadius: 3,
                    mb: 1,
                    py: 1.5,
                    "&:hover": { 
                      background: "rgba(255,255,255,0.1)",
                      transform: "translateX(4px)",
                    },
                    transition: "all 0.3s ease",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {selected === feature.key && (
                    <motion.div
                      layoutId="activeTab"
                      initial={false}
                      style={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        right: 0,
                        bottom: 0,
                        background: "rgba(255,255,255,0.15)",
                        borderRadius: 12,
                      }}
                    />
                  )}
                  <ListItemIcon sx={{ color: "#fff", minWidth: 40, zIndex: 1 }}>
                    {feature.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={feature.label}
                    sx={{ 
                      zIndex: 1,
                      "& .MuiListItemText-primary": {
                        fontWeight: selected === feature.key ? 600 : 500,
                      }
                    }}
                  />
                </ListItem>
              </Tooltip>
            </motion.div>
          ))}
        </List>
      </Box>

      {/* Stats & Quick Actions */}
      <Box sx={{ p: 3, mt: "auto" }}>
        <Box
          sx={{
            bgcolor: "rgba(255,255,255,0.1)",
            borderRadius: 3,
            p: 2,
            mb: 2,
            textAlign: "center",
          }}
        >
          <TrendingUpIcon sx={{ color: "#81c784", mb: 1 }} />
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)" }}>
            Tiến độ học tập
          </Typography>
          <Typography variant="h6" sx={{ color: "white", fontWeight: 700 }}>
            0%
          </Typography>
        </Box>

        <ListItem
          button
          onClick={handleLogout}
          sx={{
            borderRadius: 3,
            bgcolor: "rgba(255,255,255,0.1)",
            "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
            transition: "all 0.3s ease",
          }}
        >
          <ListItemIcon sx={{ color: "#ffcdd2", minWidth: 40 }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText 
            primary="Đăng xuất" 
            sx={{ color: "#ffcdd2" }}
          />
        </ListItem>
      </Box>
    </Box>
  );

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          display: "flex",
          height: "100vh",
          background: "linear-gradient(135deg, #f8fafc 0%, #e3f2fd 100%)",
        }}
      >
        {!token ? (
          // ========== LOGIN SCREEN ==========
          <Box
            sx={{
              m: "auto",
              p: 4,
              borderRadius: 4,
              boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
              backgroundColor: "white",
              width: isMobile ? "90%" : 450,
              maxWidth: 450,
              border: "1px solid rgba(255,255,255,0.2)",
            }}
            component={motion.div}
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <Box sx={{ textAlign: "center", mb: 4 }}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: 3,
                    background: "linear-gradient(135deg, #1565c0, #42a5f5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mx: "auto",
                    mb: 3,
                    color: "white",
                    fontSize: "2rem",
                    fontWeight: 700,
                  }}
                >
                  P
                </Box>
              </motion.div>
              <Typography variant="h4" color="primary" sx={{ mb: 1 }}>
                Pathwise
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Nền tảng học tập thông minh
              </Typography>
            </Box>
            <AuthForm onLoginSuccess={handleLoginSuccess} />
          </Box>
        ) : (
          <>
            {/* ========== SIDEBAR ==========*/}
            <Box
              component="nav"
              sx={{
                width: { md: 280 },
                flexShrink: { md: 0 },
              }}
            >
              {/* Mobile drawer */}
              <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{ keepMounted: true }}
                sx={{
                  display: { xs: "block", md: "none" },
                  "& .MuiDrawer-paper": {
                    boxSizing: "border-box",
                    width: 280,
                    background: "linear-gradient(180deg, #1565c0 0%, #0d47a1 100%)",
                    color: "#fff",
                    border: "none",
                  },
                }}
              >
                {sidebarContent}
              </Drawer>

              {/* Desktop drawer */}
              <Drawer
                variant="permanent"
                sx={{
                  display: { xs: "none", md: "block" },
                  "& .MuiDrawer-paper": {
                    boxSizing: "border-box",
                    width: 280,
                    background: "linear-gradient(180deg, #1565c0 0%, #0d47a1 100%)",
                    color: "#fff",
                    border: "none",
                    boxShadow: "4px 0 20px rgba(0,0,0,0.1)",
                  },
                }}
              >
                {sidebarContent}
              </Drawer>
            </Box>

            {/* ========== MAIN CONTENT ==========*/}
            <Box 
              sx={{ 
                flexGrow: 1, 
                display: "flex", 
                flexDirection: "column",
                minHeight: "100vh",
                overflow: "hidden",
              }}
            >
              {/* Top Navigation */}
              <AppBar
                position="sticky"
                elevation={0}
                sx={{
                  background: "rgba(255,255,255,0.95)",
                  backdropFilter: "blur(10px)",
                  borderBottom: "1px solid rgba(0,0,0,0.06)",
                  color: "text.primary",
                }}
              >
                <Toolbar sx={{ gap: 2 }}>
                  <IconButton
                    color="inherit"
                    edge="start"
                    onClick={handleDrawerToggle}
                    sx={{ display: { md: "none" } }}
                  >
                    <MenuIcon />
                  </IconButton>

                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {currentFeature?.label}
                    </Typography>
                    {currentFeature?.description && (
                      <Typography variant="body2" color="text.secondary">
                        {currentFeature.description}
                      </Typography>
                    )}
                  </Box>

                  <Stack direction="row" spacing={1} alignItems="center">
                    <Tooltip title="Thông báo">
                      <IconButton>
                        <Badge badgeContent={notifications} color="error">
                          <NotificationsIcon />
                        </Badge>
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Cài đặt tài khoản">
                      <IconButton onClick={handleMenuOpen}>
                        <Avatar sx={{ width: 32, height: 32, fontSize: "0.9rem" }}>
                          {user?.full_name?.[0]?.toUpperCase() || "U"}
                        </Avatar>
                      </IconButton>
                    </Tooltip>

                    <Menu
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl)}
                      onClose={handleMenuClose}
                      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    >
                      <MenuItem onClick={handleMenuClose}>
                        <PersonIcon sx={{ mr: 1 }} /> Hồ sơ cá nhân
                      </MenuItem>
                      <MenuItem onClick={handleMenuClose}>
                        <SettingsIcon sx={{ mr: 1 }} /> Cài đặt
                      </MenuItem>
                      <Divider />
                      <MenuItem onClick={handleLogout} sx={{ color: "error.main" }}>
                        <LogoutIcon sx={{ mr: 1 }} /> Đăng xuất
                      </MenuItem>
                    </Menu>
                  </Stack>
                </Toolbar>
              </AppBar>

              {/* Content Area */}
              <Box 
                sx={{ 
                  flexGrow: 1, 
                  p: { xs: 2, md: 3 }, 
                  overflowY: "auto",
                  background: "transparent",
                }}
              >
                <Suspense fallback={<LoadingScreen />}>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={selected}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      {(() => {
                        const FeatureComp = currentFeature?.component;
                        return FeatureComp ? (
                          <FeatureComp 
                            token={token} 
                            userId={userId}
                            user={user}
                            onLogout={handleLogout}
                          />
                        ) : null;
                      })()}
                    </motion.div>
                  </AnimatePresence>
                </Suspense>
              </Box>
            </Box>
          </>
        )}
      </Box>
    </ThemeProvider>
  );
}