import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Paper,
  CircularProgress,
} from "@mui/material";
import axios from "axios";
import { motion } from "framer-motion";
import RateReviewIcon from "@mui/icons-material/RateReview";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";

// Bộ sưu tập quotes ngẫu nhiên
const quotes = [
  "Học tập là hạt giống của sự thành công. 🌱",
  "Mỗi phản hồi của bạn giúp chúng tôi phát triển! 🚀",
  "Chia sẻ của bạn sẽ giúp nâng tầm khóa học. 💡",
  "Kiến thức không có giới hạn, và phản hồi của bạn cũng vậy. 📚",
  "Cùng nhau xây dựng hành trình học tập tốt hơn. 🤝",
  "Ý tưởng lớn bắt đầu từ những góp ý nhỏ. 🌟",
];

export default function FeedbackForm() {
  const [courseId, setCourseId] = useState("");
  const [feedback, setFeedback] = useState("");
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [quote, setQuote] = useState("");

  const handleFeedback = async (e) => {
    e.preventDefault();
    setMsg(null);
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `/feedback/feedback?course_id=${encodeURIComponent(courseId)}&feedback=${encodeURIComponent(
          feedback
        )}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Chọn một câu quote ngẫu nhiên
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
      setQuote(randomQuote);

      setMsg({ type: "success", text: "Gửi feedback thành công!" });
      setCourseId("");
      setFeedback("");
    } catch (err) {
      setMsg({ type: "error", text: "Không gửi được feedback!" });
      setQuote("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper
      elevation={6}
      sx={{
        maxWidth: 500,
        mx: "auto",
        mt: 5,
        p: 4,
        borderRadius: 4,
        background: "linear-gradient(135deg, #f5f7fa, #e4ecf7)",
      }}
      component={motion.div}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Tiêu đề */}
      <Typography
        variant="h4"
        sx={{
          mb: 3,
          fontWeight: 700,
          textAlign: "center",
          color: "#1976d2",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 1,
        }}
      >
        <RateReviewIcon sx={{ fontSize: 32, color: "#ff9800" }} />
        Gửi Feedback
      </Typography>

      {/* Form */}
      <Box
        component="form"
        onSubmit={handleFeedback}
        sx={{ display: "flex", flexDirection: "column", gap: 2 }}
      >
        <TextField
          label="Course ID"
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
          fullWidth
          required
          sx={{
            background: "#fff",
            borderRadius: 2,
          }}
        />
        <TextField
          label="Nhập phản hồi"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          fullWidth
          required
          multiline
          rows={4}
          sx={{
            background: "#fff",
            borderRadius: 2,
          }}
        />

        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{
            py: 1.5,
            fontWeight: 600,
            borderRadius: 3,
            background: "linear-gradient(90deg, #1976d2, #2196f3)",
            "&:hover": {
              background: "linear-gradient(90deg, #1565c0, #1e88e5)",
            },
          }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} sx={{ color: "#fff" }} /> : "Gửi Feedback"}
        </Button>
      </Box>

      {/* Alert thông báo */}
      {msg && (
        <Alert
          severity={msg.type}
          sx={{
            mt: 3,
            borderRadius: 2,
            fontSize: "1rem",
          }}
          component={motion.div}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {msg.text}
        </Alert>
      )}

      {/* Hiển thị quote động */}
      {quote && (
        <Typography
          variant="subtitle1"
          sx={{
            mt: 3,
            textAlign: "center",
            fontStyle: "italic",
            color: "#555",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
          }}
          component={motion.div}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <EmojiEmotionsIcon sx={{ color: "#ff9800" }} />
          {quote}
        </Typography>
      )}
    </Paper>
  );
}
