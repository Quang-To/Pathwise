import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Alert,
  Grid,
  Card,
  CardContent,
  CircularProgress,
} from "@mui/material";
import axios from "axios";
import API_BASES from "../apiConfig";
import { motion } from "framer-motion";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import SchoolIcon from "@mui/icons-material/School";
import RefreshIcon from "@mui/icons-material/Refresh";

// 🔹 Danh sách quote đa dạng
const QUOTES = [
  "Một bước tiến gần hơn đến mục tiêu học tập của bạn!",
  "Học hôm nay, thành công ngày mai!",
  "Tri thức là sức mạnh, hãy khám phá ngay!",
  "Khám phá và phát triển tiềm năng bản thân.",
  "Mỗi khóa học là một cơ hội mới.",
  "Đừng ngại thử thách, bạn sẽ vượt qua!",
  "Học để thay đổi tương lai của bạn.",
  "Thách thức mới, kiến thức mới!",
  "Mỗi ngày một chút, tiến bộ từng bước.",
  "Tận dụng thời gian, học ngay hôm nay!",
  "Mở rộng kỹ năng, mở rộng cơ hội.",
  "Học hỏi không ngừng để dẫn đầu.",
  "Khám phá kiến thức, mở ra cánh cửa thành công.",
  "Đam mê học tập, tạo ra khác biệt.",
  "Học để làm chủ tương lai.",
  "Kiến thức hôm nay là lợi thế ngày mai.",
  "Đặt mục tiêu, chinh phục thử thách.",
  "Tận hưởng hành trình học tập.",
  "Mỗi khóa học là một bức tranh tri thức.",
  "Phát triển bản thân, vươn tới ước mơ.",
];

export default function Recommendation({ token }) {
  const [courses, setCourses] = useState([]);
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchRecommend = async () => {
    setMsg(null);
    setLoading(true);
    try {
      const res = await axios.post(
        `${API_BASES.recommendation}/recommend-courses`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = Array.isArray(res.data?.courses) ? res.data.courses : [];
      setCourses(data);

      if (!data || data.length === 0) {
        setMsg({ type: "info", text: "Hiện chưa có gợi ý nào!" });
      }
    } catch (err) {
      console.error("Lỗi lấy gợi ý:", err, err?.response?.data);
      setMsg({ type: "error", text: "Không lấy được gợi ý!" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchRecommend();
  }, [token]);

  const getQuote = (idx) => QUOTES[idx % QUOTES.length];

  return (
    <Box
      sx={{
        p: 3,
        borderRadius: 4,
        background: "linear-gradient(135deg, #fdfbfb, #ebedee)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        position: "relative",
      }}
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: "#1976d2",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
          component={motion.div}
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <AutoAwesomeIcon sx={{ color: "#ff9800" }} /> Gợi ý khóa học
        </Typography>

        <Button
          variant="contained"
          color="primary"
          onClick={fetchRecommend}
          startIcon={<RefreshIcon />}
          disabled={loading}
          sx={{ px: 3, py: 1, borderRadius: 3 }}
        >
          {loading ? "Đang tải..." : "Lấy gợi ý"}
        </Button>
      </Box>

      {/* Thông báo */}
      {msg && (
        <Alert
          severity={msg.type}
          sx={{ mb: 3 }}
          component={motion.div}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {msg.text}
        </Alert>
      )}

      {/* Loading */}
      {loading && (
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <CircularProgress color="primary" size={50} />
          <Typography sx={{ mt: 2, color: "text.secondary" }}>
            Đang tải gợi ý...
          </Typography>
        </Box>
      )}

      {/* Grid danh sách khóa học */}
      {!loading && courses.length > 0 && (
        <Grid container spacing={3}>
          {courses.map((course, idx) => (
            <Grid item xs={12} sm={6} md={4} key={idx}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  borderRadius: 3,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  background: "linear-gradient(145deg, #ffffff, #e3f2fd)",
                  "&:hover": {
                    transform: "scale(1.05)",
                    transition: "0.3s ease-in-out",
                    boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
                  },
                }}
                component={motion.div}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
              >
                <CardContent
                  sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    textAlign: "center",
                    p: 3,
                  }}
                >
                  <SchoolIcon sx={{ fontSize: 40, color: "#1976d2", mb: 1 }} />
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color: "#333",
                      minHeight: "48px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      textAlign: "center",
                    }}
                  >
                    {course}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      mt: 1,
                      color: "#555",
                      fontStyle: "italic",
                      minHeight: "40px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      textAlign: "center",
                    }}
                  >
                    {getQuote(idx)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Không có gợi ý */}
      {!loading && courses.length === 0 && !msg && (
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ textAlign: "center", mt: 2 }}
        >
          Hiện chưa có gợi ý nào. Hãy nhấn "Lấy gợi ý" để khám phá!
        </Typography>
      )}
    </Box>
  );
}
