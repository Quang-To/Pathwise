import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Alert,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Chip,
  Avatar,
  Paper,
  Skeleton,
  IconButton,
  Tooltip,
  Fade,
  Container,
  useTheme,
  useMediaQuery,
  LinearProgress,
  Divider,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import SchoolIcon from "@mui/icons-material/School";
import WorkIcon from "@mui/icons-material/Work";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import EmojiObjectsIcon from "@mui/icons-material/EmojiObjects";
import RefreshIcon from "@mui/icons-material/Refresh";
import AssignmentIcon from "@mui/icons-material/Assignment";
import StarIcon from "@mui/icons-material/Star";
import TargetIcon from "@mui/icons-material/GpsFixed";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import MapIcon from "@mui/icons-material/Map";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import API_BASES from "../apiConfig";

// Enhanced quotes focused on career development
const quotes = [
  { text: "Nghề nghiệp không phải là điểm đến, mà là hành trình không ngừng học hỏi.", author: "Steve Jobs", category: "career" },
  { text: "Đầu tư vào kỹ năng ngày hôm nay để tạo nên sự nghiệp ngày mai.", author: "Warren Buffett", category: "investment" },
  { text: "Thành công thuộc về những ai chuẩn bị kỹ lưỡng cho cơ hội.", author: "Benjamin Franklin", category: "preparation" },
  { text: "Học tập là hạt giống của tri thức, hành động là quả ngọt của sự khôn ngoan.", author: "Khuyết danh", category: "wisdom" },
  { text: "Mục tiêu không có kế hoạch chỉ là ước mơ.", author: "Antoine de Saint-Exupéry", category: "planning" },
  { text: "Con đường nghìn dặm bắt đầu từ bước chân đầu tiên.", author: "Lão Tử", category: "journey" },
];

// Career-focused motivational quotes
const careerQuotes = [
  { text: "Mỗi kỹ năng học được hôm nay là nền tảng cho sự nghiệp ngày mai", emoji: "🎯" },
  { text: "Xây dựng sự nghiệp không chỉ bằng kiến thức mà còn bằng đam mê", emoji: "🔥" },
  { text: "Hành trình nghìn dặm bắt đầu từ mục tiêu đầu tiên", emoji: "🚀" },
  { text: "Thành công là giao điểm giữa chuẩn bị và cơ hội", emoji: "⭐" },
  { text: "Đầu tư vào bản thân là khoản đầu tư sinh lời nhất", emoji: "💎" },
  { text: "Học hôm nay, dẫn đầu ngày mai, thành công mãi mãi", emoji: "🏆" },
];

// Career icons mapping
const careerIcons = {
  "Lập trình viên": "💻",
  "Nhà phát triển": "🛠️",
  "Kỹ sư": "⚙️",
  "Nhà thiết kế": "🎨",
  "Nhà quản lý": "👔",
  "Nhà phân tích": "📊",
  "Nhà marketing": "📈",
  "Giáo viên": "👨‍🏫",
  "Nhà nghiên cứu": "🔬",
  "Tư vấn viên": "🎯",
  "default": "🎯"
};

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

// Enhanced skeleton loader
const DashboardSkeleton = () => (
  <Grid container spacing={3}>
    <Grid item xs={12}>
      <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 3 }} />
    </Grid>
    {[1, 2].map((i) => (
      <Grid item xs={12} md={6} key={i}>
        <Card sx={{ borderRadius: 3, height: 280 }}>
          <CardContent>
            <Skeleton variant="text" width="60%" height={32} />
            <Box sx={{ mt: 2 }}>
              {[1, 2, 3].map((j) => (
                <Box key={j} sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <Skeleton variant="circular" width={24} height={24} sx={{ mr: 2 }} />
                  <Skeleton variant="text" width="80%" />
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Grid>
    ))}
    <Grid item xs={12}>
      <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 4 }} />
    </Grid>
  </Grid>
);

// Enhanced card component
const EnhancedCard = ({ children, delay = 0, ...props }) => (
  <motion.div
    variants={itemVariants}
    initial="hidden"
    animate="visible"
    transition={{ delay }}
    whileHover={{ y: -4, transition: { duration: 0.2 } }}
  >
    <Card
      {...props}
      sx={{
        borderRadius: 3,
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        transition: "all 0.3s ease-in-out",
        "&:hover": {
          boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
        },
        ...props.sx,
      }}
    >
      {children}
    </Card>
  </motion.div>
);

// Career Goal Card Component
const CareerGoalCard = ({ goal, index, isMainGoal = false }) => {
  const getCareerIcon = (goalText) => {
    for (const [key, icon] of Object.entries(careerIcons)) {
      if (goalText.toLowerCase().includes(key.toLowerCase())) {
        return icon;
      }
    }
    return careerIcons.default;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ 
        delay: index * 0.1,
        type: "spring",
        stiffness: 100,
        damping: 15
      }}
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
    >
      <Card
        sx={{
          background: isMainGoal 
            ? "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)" 
            : "linear-gradient(135deg, #fff 0%, #f8f9ff 100%)",
          color: isMainGoal ? "white" : "inherit",
          border: isMainGoal ? "none" : "2px solid #e3f2fd",
          borderRadius: 4,
          p: 3,
          position: "relative",
          overflow: "hidden",
          minHeight: 140,
          display: "flex",
          alignItems: "center",
          cursor: "pointer",
          transition: "all 0.3s ease",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: isMainGoal 
              ? "0 12px 40px rgba(25, 118, 210, 0.3)"
              : "0 8px 30px rgba(25, 118, 210, 0.15)",
          },
        }}
      >
        {/* Background decoration */}
        <Box
          sx={{
            position: "absolute",
            top: -20,
            right: -20,
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: isMainGoal 
              ? "rgba(255,255,255,0.1)" 
              : "rgba(25, 118, 210, 0.05)",
          }}
        />
        
        {/* Main goal indicator */}
        {isMainGoal && (
          <Box
            sx={{
              position: "absolute",
              top: 12,
              right: 12,
            }}
          >
            <StarIcon sx={{ color: "#ffd700", fontSize: 24 }} />
          </Box>
        )}
        
        <Box sx={{ display: "flex", alignItems: "center", width: "100%", position: "relative", zIndex: 1 }}>
          <Box
            sx={{
              fontSize: "3rem",
              mr: 3,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: isMainGoal 
                ? "rgba(255,255,255,0.15)" 
                : "rgba(25, 118, 210, 0.08)",
              backdropFilter: "blur(10px)",
            }}
          >
            {getCareerIcon(goal)}
          </Box>
          
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                mb: 1,
                color: isMainGoal ? "white" : "#1976d2",
                fontSize: "1.1rem",
                lineHeight: 1.3,
              }}
            >
              {goal}
            </Typography>
            
            {isMainGoal && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <TargetIcon sx={{ fontSize: 16, opacity: 0.8 }} />
                <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500 }}>
                  Mục tiêu nghề nghiệp chính
                </Typography>
              </Box>
            )}
            
            {!isMainGoal && (
              <LinearProgress
                variant="indeterminate"
                sx={{
                  mt: 1,
                  height: 4,
                  borderRadius: 2,
                  bgcolor: "#e3f2fd",
                  "& .MuiLinearProgress-bar": {
                    bgcolor: "#1976d2",
                    borderRadius: 2,
                  },
                }}
              />
            )}
          </Box>
        </Box>
      </Card>
    </motion.div>
  );
};

export default function Dashboard({ token, user, onLogout }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  
  const [dashboardData, setDashboardData] = useState(null);
  const [skillsMapping, setSkillsMapping] = useState({});
  const [loadingDashboard, setLoadingDashboard] = useState(false);
  const [loadingSkills, setLoadingSkills] = useState(false);
  const [msg, setMsg] = useState(null);
  const [quote, setQuote] = useState(quotes[0]);
  const [careerQuote, setCareerQuote] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const userId = user?.user_id || user?.id;

  // Normalize API response
  const normalizeDashboard = (raw) => {
    const learning_goals = Array.isArray(raw?.learning_goals)
      ? raw.learning_goals
      : raw?.learning_goals
      ? [String(raw.learning_goals)]
      : [];

    const recommended_courses = Array.isArray(raw?.recommended_courses)
      ? raw.recommended_courses.map((name, idx) => ({
          course_name: name,
          course_id: (raw.course_id && raw.course_id[idx]) || "",
        }))
      : [];

    return { learning_goals, recommended_courses };
  };

  // Fetch dashboard data
  const fetchDashboard = async () => {
    setLoadingDashboard(true);
    setMsg(null);
    try {
      const res = await axios.get(`${API_BASES.dashboard}/learning-dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDashboardData(normalizeDashboard(res.data));
    } catch (err) {
      console.error("Dashboard error:", err);
      setMsg({ 
        type: "error", 
        text: "Không thể tải dữ liệu Dashboard. Vui lòng thử lại sau." 
      });
    } finally {
      setLoadingDashboard(false);
    }
  };

  // Fetch skills mapping
  const fetchSkillsMapping = async () => {
    setLoadingSkills(true);
    try {
      const res = await axios.get(API_BASES.skillsMapping, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data?.mappings;
      if (!data || typeof data !== "object") {
        setSkillsMapping({});
        setMsg({ type: "warning", text: "Chưa có dữ liệu phân tích kỹ năng." });
      } else {
        setSkillsMapping(data);
        const randomCareerQuote = careerQuotes[Math.floor(Math.random() * careerQuotes.length)];
        setCareerQuote(randomCareerQuote);
      }
      console.log("Current user ID (frontend):", userId);
    } catch (err) {
      console.error("Skill mapping error:", err);
      setMsg({ type: "error", text: "Không thể tải dữ liệu phân tích kỹ năng!" });
    } finally {
      setLoadingSkills(false);
    }
  };

  // Refresh data
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchDashboard(), fetchSkillsMapping()]);
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    setCareerQuote(careerQuotes[Math.floor(Math.random() * careerQuotes.length)]);
    setRefreshing(false);
  };

  // Init fetch
  useEffect(() => {
    if (token) {
      fetchDashboard();
      fetchSkillsMapping();
      setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
      setCareerQuote(careerQuotes[Math.floor(Math.random() * careerQuotes.length)]);
    }
  }, [token]);

  // Auto-dismiss alerts
  useEffect(() => {
    if (msg) {
      const timer = setTimeout(() => setMsg(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [msg]);

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header with refresh button */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
            flexDirection: isMobile ? "column" : "row",
            gap: isMobile ? 2 : 0,
          }}
        >
          <motion.div variants={itemVariants}>
            <Box sx={{ textAlign: isMobile ? "center" : "left" }}>
              <Typography
                variant={isMobile ? "h5" : "h4"}
                sx={{
                  fontWeight: 700,
                  background: "linear-gradient(45deg, #1976d2, #42a5f5)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  mb: 1,
                }}
              >
                🎯 Career Learning Hub
              </Typography>
              <Typography variant="subtitle1" color="text.secondary" sx={{ fontWeight: 500 }}>
                Xây dựng sự nghiệp từ việc học tập có mục tiêu
              </Typography>
            </Box>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <Tooltip title="Làm mới dữ liệu">
                <IconButton
                  onClick={handleRefresh}
                  disabled={refreshing}
                  sx={{
                    bgcolor: "primary.main",
                    color: "white",
                    "&:hover": { bgcolor: "primary.dark" },
                  }}
                >
                  <RefreshIcon
                    sx={{
                      animation: refreshing ? "spin 1s linear infinite" : "none",
                      "@keyframes spin": {
                        "0%": { transform: "rotate(0deg)" },
                        "100%": { transform: "rotate(360deg)" },
                      },
                    }}
                  />
                </IconButton>
              </Tooltip>
              
              {onLogout && (
                <Button
                  onClick={onLogout}
                  variant="outlined"
                  startIcon={<LogoutIcon />}
                  sx={{
                    borderRadius: 2,
                    px: 3,
                    fontWeight: 600,
                    textTransform: "none",
                  }}
                >
                  Đăng xuất
                </Button>
              )}
            </Box>
          </motion.div>
        </Box>

        {/* Enhanced Quote Section */}
        <motion.div variants={itemVariants}>
          <Paper
            elevation={0}
            sx={{
              mb: 4,
              p: 4,
              background: "linear-gradient(135deg, #e3f2fd 0%, #f8f9fa 100%)",
              borderRadius: 4,
              border: "1px solid rgba(25, 118, 210, 0.12)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: -30,
                right: -30,
                width: 120,
                height: 120,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #1976d2, #42a5f5)",
                opacity: 0.08,
              }}
            />
            <Box sx={{ textAlign: "center", position: "relative", zIndex: 1 }}>
              <FormatQuoteIcon 
                sx={{ 
                  fontSize: 56, 
                  color: "#42a5f5", 
                  mb: 2,
                  filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.1))",
                }} 
              />
              <Typography 
                variant="h5" 
                sx={{ 
                  fontStyle: "italic", 
                  mb: 3, 
                  fontWeight: 500,
                  lineHeight: 1.6,
                  color: "#333",
                }}
              >
                "{quote.text}"
              </Typography>
              <Chip 
                label={`— ${quote.author}`} 
                sx={{ 
                  bgcolor: "rgba(25, 118, 210, 0.1)",
                  color: "#1976d2",
                  fontWeight: 600,
                  fontSize: "1rem",
                  px: 2,
                  py: 1,
                }}
              />
            </Box>
          </Paper>
        </motion.div>

        {/* Alert message with animation */}
        <AnimatePresence>
          {msg && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Alert
                severity={msg.type}
                sx={{ mb: 3, borderRadius: 2 }}
                onClose={() => setMsg(null)}
              >
                {msg.text}
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        {loadingDashboard ? (
          <DashboardSkeleton />
        ) : dashboardData ? (
          <Grid container spacing={3}>
            {/* Enhanced Stats Overview */}
            <Grid item xs={12}>
              <motion.div variants={itemVariants}>
                <Paper
                  sx={{
                    p: 4,
                    mb: 3,
                    background: "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
                    color: "white",
                    borderRadius: 4,
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {/* Background pattern */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      width: "40%",
                      height: "100%",
                      background: "url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><circle cx=\"50\" cy=\"50\" r=\"40\" fill=\"none\" stroke=\"rgba(255,255,255,0.08)\" stroke-width=\"2\"/><circle cx=\"50\" cy=\"50\" r=\"25\" fill=\"none\" stroke=\"rgba(255,255,255,0.05)\" stroke-width=\"2\"/></svg>')",
                      backgroundSize: "80px 80px",
                      opacity: 0.3,
                    }}
                  />
                  
                  <Grid container spacing={3} alignItems="center">
                    <Grid item xs={12} md={3} sx={{ textAlign: "center" }}>
                      <RocketLaunchIcon sx={{ fontSize: 56, mb: 1 }} />
                      <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                        {dashboardData.learning_goals.length}
                      </Typography>
                      <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 500 }}>
                        Mục tiêu nghề nghiệp
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={3} sx={{ textAlign: "center" }}>
                      <SchoolIcon sx={{ fontSize: 56, mb: 1 }} />
                      <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                        {dashboardData.recommended_courses.length}
                      </Typography>
                      <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 500 }}>
                        Khóa học gợi ý
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={3} sx={{ textAlign: "center" }}>
                      <EmojiObjectsIcon sx={{ fontSize: 56, mb: 1 }} />
                      <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                        {Object.keys(skillsMapping).length}
                      </Typography>
                      <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 500 }}>
                        Kỹ năng cần phát triển
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={3} sx={{ textAlign: "center" }}>
                      <TrendingUpIcon sx={{ fontSize: 56, mb: 1 }} />
                      <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                        85%
                      </Typography>
                      <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 500 }}>
                        Tiến độ học tập
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </motion.div>
            </Grid>

            {/* Enhanced Career Goals Section */}
            <Grid item xs={12}>
              <motion.div variants={itemVariants}>
                <Paper
                  elevation={4}
                  sx={{
                    p: 4,
                    borderRadius: 4,
                    mb: 3,
                    background: "linear-gradient(135deg, #fff 0%, #f8f9ff 100%)",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {/* Header Section */}
                  <Box sx={{ mb: 4, textAlign: "center" }}>
                    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", mb: 2 }}>
                      <WorkIcon sx={{ fontSize: 40, color: "#1976d2", mr: 2 }} />
                      <Typography
                        variant="h4"
                        sx={{
                          fontWeight: 700,
                          color: "#1976d2",
                        }}
                      >
                        Mục tiêu nghề nghiệp của bạn
                      </Typography>
                    </Box>

                    {careerQuote && (
                      <Fade in={true} timeout={1000}>
                        <Box
                          sx={{
                            mb: 3,
                            p: 3,
                            bgcolor: "rgba(25, 118, 210, 0.05)",
                            borderRadius: 3,
                            border: "1px solid rgba(25, 118, 210, 0.1)",
                          }}
                        >
                          <Typography
                            variant="h6"
                            sx={{
                              fontStyle: "italic",
                              color: "#1976d2",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 2,
                              fontWeight: 600,
                            }}
                          >
                            <span style={{ fontSize: "2rem" }}>{careerQuote.emoji}</span>
                            {careerQuote.text}
                          </Typography>
                        </Box>
                      </Fade>
                    )}
                  </Box>

                  {/* Career Goals Content */}
                  {dashboardData.learning_goals.length === 0 ? (
                    <Box sx={{ textAlign: "center", py: 6 }}>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                      >
                        <Box
                          sx={{
                            width: 120,
                            height: 120,
                            borderRadius: "50%",
                            bgcolor: "#e3f2fd",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            mx: "auto",
                            mb: 3,
                          }}
                        >
                          <MapIcon sx={{ fontSize: 60, color: "#1976d2" }} />
                        </Box>
                        <Typography variant="h5" color="text.primary" sx={{ mb: 2, fontWeight: 600 }}>
                          Chưa thiết lập mục tiêu nghề nghiệp
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 500, mx: "auto" }}>
                          Hãy xác định rõ nghề nghiệp bạn muốn hướng tới để chúng tôi có thể đề xuất 
                          lộ trình학습 phù hợp và các khóa học cần thiết
                        </Typography>
                        <Button
                          variant="contained"
                          size="large"
                          startIcon={<TargetIcon />}
                          sx={{
                            borderRadius: 3,
                            px: 4,
                            py: 1.5,
                            fontWeight: 600,
                            textTransform: "none",
                            fontSize: "1.1rem",
                          }}
                        >
                          Thiết lập mục tiêu ngay
                        </Button>
                      </motion.div>
                    </Box>
                  ) : (
                    <Grid container spacing={3}>
                      {dashboardData.learning_goals.map((goal, idx) => (
                        <Grid 
                          item 
                          xs={12} 
                          md={dashboardData.learning_goals.length === 1 ? 12 : 6}
                          lg={dashboardData.learning_goals.length <= 2 ? 6 : 4}
                          key={`career-goal-${idx}`}
                        >
                          <CareerGoalCard 
                            goal={goal} 
                            index={idx} 
                            isMainGoal={idx === 0}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  )}
                  
                  {/* Progress Indicator */}
                  {dashboardData.learning_goals.length > 0 && (
                    <Box sx={{ mt: 4, pt: 3, borderTop: "1px solid rgba(25, 118, 210, 0.1)" }}>
                      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: "#1976d2", textAlign: "center" }}>
                        📈 Tiến trình phát triển sự nghiệp
                      </Typography>
                      <Box sx={{ display: "flex", justifyContent: "center", gap: 2, flexWrap: "wrap" }}>
                        <Chip
                          icon={<CheckCircleIcon />}
                          label="Mục tiêu đã xác định"
                          sx={{
                            bgcolor: "#e8f5e8",
                            color: "#4caf50",
                            fontWeight: 600,
                          }}
                        />
                        <Chip
                          icon={<PlayCircleIcon />}
                          label="Đang học tập"
                          sx={{
                            bgcolor: "#fff3e0",
                            color: "#ff9800",
                            fontWeight: 600,
                          }}
                        />
                        <Chip
                          icon={<StarIcon />}
                          label="Chuẩn bị thành công"
                          sx={{
                            bgcolor: "#e3f2fd",
                            color: "#1976d2",
                            fontWeight: 600,
                          }}
                        />
                      </Box>
                    </Box>
                  )}
                </Paper>
              </motion.div>
            </Grid>

            {/* Recommended Courses */}
            <Grid item xs={12} md={6}>
              <EnhancedCard delay={0.1} sx={{ height: "100%", minHeight: 400 }}>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                    <Avatar sx={{ bgcolor: "#e8f5e8", color: "#4caf50", mr: 2, width: 56, height: 56 }}>
                      <SchoolIcon sx={{ fontSize: 28 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: "#4caf50", mb: 0.5 }}>
                        Khóa học được gợi ý
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Dựa trên mục tiêu nghề nghiệp của bạn
                      </Typography>
                    </Box>
                  </Box>
                  
                  {dashboardData.recommended_courses.length === 0 ? (
                    <Box sx={{ textAlign: "center", py: 4 }}>
                      <SchoolIcon sx={{ fontSize: 80, color: "#ccc", mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                        Chưa có khóa học gợi ý
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Hệ thống đang phân tích mục tiêu của bạn để đưa ra gợi ý phù hợp
                      </Typography>
                    </Box>
                  ) : (
                    <List sx={{ p: 0 }}>
                      {dashboardData.recommended_courses.map((course, idx) => (
                        <motion.div
                          key={`course-${idx}`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                        >
                          <ListItem
                            sx={{
                              px: 0,
                              py: 2,
                              borderRadius: 3,
                              mb: 1,
                              "&:hover": {
                                bgcolor: "#f5f5f5",
                                transform: "translateX(4px)",
                              },
                              transition: "all 0.3s ease",
                            }}
                          >
                            <Avatar
                              sx={{
                                bgcolor: "#4caf50",
                                mr: 3,
                                width: 48,
                                height: 48,
                                fontSize: "1.2rem",
                                fontWeight: 700,
                              }}
                            >
                              {course.course_name.charAt(0).toUpperCase()}
                            </Avatar>
                            <ListItemText
                              primary={course.course_name}
                              secondary={
                                <Box sx={{ mt: 1 }}>
                                  <Chip 
                                    label={`ID: ${course.course_id || "Đang cập nhật"}`}
                                    size="small"
                                    sx={{
                                      bgcolor: "#e8f5e8",
                                      color: "#4caf50",
                                      fontSize: "0.75rem",
                                    }}
                                  />
                                </Box>
                              }
                              primaryTypographyProps={{ 
                                fontWeight: 600,
                                fontSize: "1.1rem",
                                color: "#333",
                              }}
                            />
                            <IconButton
                              sx={{
                                bgcolor: "#4caf50",
                                color: "white",
                                "&:hover": { bgcolor: "#388e3c" },
                              }}
                            >
                              <PlayCircleIcon />
                            </IconButton>
                          </ListItem>
                        </motion.div>
                      ))}
                    </List>
                  )}
                </CardContent>
              </EnhancedCard>
            </Grid>

            {/* Skills Progress */}
            <Grid item xs={12} md={6}>
              <EnhancedCard delay={0.2} sx={{ height: "100%", minHeight: 400 }}>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                    <Avatar sx={{ bgcolor: "#fff3e0", color: "#ff9800", mr: 2, width: 56, height: 56 }}>
                      <TrendingUpIcon sx={{ fontSize: 28 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: "#ff9800", mb: 0.5 }}>
                        Tiến độ kỹ năng
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Theo dõi sự phát triển của bạn
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ space: 2 }}>
                    {Object.keys(skillsMapping).slice(0, 5).map((skill, idx) => (
                      <Box key={skill} sx={{ mb: 3 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {skill}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {Math.floor(Math.random() * 30) + 60}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={Math.floor(Math.random() * 30) + 60}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            bgcolor: "#f5f5f5",
                            "& .MuiLinearProgress-bar": {
                              bgcolor: `hsl(${120 - (idx * 20)}, 70%, 50%)`,
                              borderRadius: 4,
                            },
                          }}
                        />
                      </Box>
                    ))}
                  </Box>

                  {Object.keys(skillsMapping).length === 0 && (
                    <Box sx={{ textAlign: "center", py: 4 }}>
                      <TrendingUpIcon sx={{ fontSize: 80, color: "#ccc", mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                        Chưa có dữ liệu tiến độ
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Bắt đầu học để theo dõi tiến độ phát triển kỹ năng
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </EnhancedCard>
            </Grid>

            {/* Skills Mapping */}
            <Grid item xs={12}>
              <motion.div variants={itemVariants}>
                <Paper
                  elevation={4}
                  sx={{
                    p: 4,
                    borderRadius: 4,
                    mt: 2,
                    background: "linear-gradient(135deg, #f8f9ff 0%, #e6ebf9 100%)",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      position: "absolute",
                      top: -50,
                      right: -50,
                      width: 150,
                      height: 150,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #ff9800, #ffc107)",
                      opacity: 0.1,
                    }}
                  />
                  
                  <Box sx={{ position: "relative", zIndex: 1 }}>
                    <Typography
                      variant="h4"
                      sx={{
                        mb: 1,
                        fontWeight: 700,
                        color: "#1976d2",
                        textAlign: "center",
                      }}
                    >
                      🎯 Bản đồ kỹ năng nghề nghiệp
                    </Typography>

                    <Typography
                      variant="subtitle1"
                      sx={{
                        textAlign: "center",
                        color: "text.secondary",
                        mb: 4,
                        fontWeight: 500,
                      }}
                    >
                      Khám phá các kỹ năng cần thiết cho mục tiêu nghề nghiệp của bạn
                    </Typography>

                    {loadingSkills ? (
                      <Box sx={{ textAlign: "center", py: 6 }}>
                        <CircularProgress size={60} sx={{ color: "#1976d2" }} />
                        <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
                          Đang phân tích kỹ năng nghề nghiệp...
                        </Typography>
                      </Box>
                    ) : Object.keys(skillsMapping).length > 0 ? (
                      <Grid container spacing={3}>
                        {Object.entries(skillsMapping).map(([skill, domains], idx) => (
                          <Grid item xs={12} sm={6} md={4} lg={3} key={skill}>
                            <motion.div
                              initial={{ opacity: 0, y: 30 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.5, delay: idx * 0.05 }}
                              whileHover={{ 
                                scale: 1.03,
                                transition: { duration: 0.2 }
                              }}
                            >
                              <Card
                                sx={{
                                  height: 260,
                                  borderRadius: 4,
                                  background: "linear-gradient(135deg, #fff 0%, #f8f9ff 100%)",
                                  border: "2px solid rgba(25, 118, 210, 0.1)",
                                  transition: "all 0.3s ease",
                                  display: "flex",
                                  flexDirection: "column",
                                  "&:hover": {
                                    boxShadow: "0 12px 40px rgba(25, 118, 210, 0.15)",
                                    borderColor: "#1976d2",
                                    transform: "translateY(-4px)",
                                  },
                                }}
                              >
                                <CardContent 
                                  sx={{ 
                                    p: 3, 
                                    textAlign: "center",
                                    display: "flex",
                                    flexDirection: "column",
                                    height: "100%",
                                    justifyContent: "space-between",
                                  }}
                                >
                                  <Box>
                                    <Box
                                      sx={{
                                        width: 70,
                                        height: 70,
                                        borderRadius: "50%",
                                        bgcolor: "#e3f2fd",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        mx: "auto",
                                        mb: 2,
                                        position: "relative",
                                        "&::after": {
                                          content: '""',
                                          position: "absolute",
                                          inset: -4,
                                          borderRadius: "50%",
                                          background: "linear-gradient(45deg, #1976d2, #42a5f5)",
                                          opacity: 0.1,
                                          zIndex: -1,
                                        }
                                      }}
                                    >
                                      <EmojiObjectsIcon 
                                        sx={{ 
                                          color: "#1976d2", 
                                          fontSize: 32,
                                        }} 
                                      />
                                    </Box>
                                    
                                    <Typography
                                      variant="h6"
                                      sx={{ 
                                        fontWeight: 700, 
                                        color: "#1976d2", 
                                        mb: 2,
                                        height: 64,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        lineHeight: 1.2,
                                      }}
                                    >
                                      {skill}
                                    </Typography>
                                  </Box>
                                  
                                  <Box sx={{ flexGrow: 1, display: "flex", alignItems: "center" }}>
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                      sx={{
                                        fontSize: "0.875rem",
                                        lineHeight: 1.5,
                                        display: "-webkit-box",
                                        WebkitLineClamp: 4,
                                        WebkitBoxOrient: "vertical",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        width: "100%",
                                      }}
                                    >
                                      {Array.isArray(domains) && domains.length > 0
                                        ? domains.join(" • ")
                                        : "Đang cập nhật nội dung kỹ năng"}
                                    </Typography>
                                  </Box>

                                  <Divider sx={{ my: 1 }} />
                                  
                                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <Chip
                                      label="Cần thiết"
                                      size="small"
                                      sx={{
                                        bgcolor: "#e8f5e8",
                                        color: "#4caf50",
                                        fontWeight: 600,
                                      }}
                                    />
                                    <Typography variant="caption" color="text.secondary">
                                      Ưu tiên cao
                                    </Typography>
                                  </Box>
                                </CardContent>
                              </Card>
                            </motion.div>
                          </Grid>
                        ))}
                      </Grid>
                    ) : (
                      <Box sx={{ textAlign: "center", py: 6 }}>
                        <EmojiObjectsIcon sx={{ fontSize: 100, color: "#ccc", mb: 3 }} />
                        <Typography variant="h5" color="text.secondary" sx={{ mb: 2, fontWeight: 600 }}>
                          Chưa có bản đồ kỹ năng
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 600, mx: "auto" }}>
                          Sau khi bạn thiết lập mục tiêu nghề nghiệp, chúng tôi sẽ tạo bản đồ kỹ năng chi tiết 
                          để giúp bạn phát triển đúng hướng
                        </Typography>
                        <Button
                          variant="contained"
                          size="large"
                          startIcon={<MapIcon />}
                          sx={{
                            borderRadius: 3,
                            px: 4,
                            py: 1.5,
                            fontWeight: 600,
                            textTransform: "none",
                            fontSize: "1.1rem",
                          }}
                        >
                          Khám phá bản đồ kỹ năng
                        </Button>
                      </Box>
                    )}
                  </Box>
                </Paper>
              </motion.div>
            </Grid>
          </Grid>
        ) : null}
      </motion.div>
    </Container>
  );
}