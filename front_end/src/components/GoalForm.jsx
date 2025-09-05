import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Paper,
} from "@mui/material";
import axios from "axios";
import API_BASES from "../apiConfig";
import { motion } from "framer-motion";
import FlagIcon from "@mui/icons-material/Flag";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

export default function GoalForm() {
  const [aspiration, setAspiration] = useState("");
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSetGoal = async (e) => {
    e.preventDefault();
    setMsg(null);

    const token = localStorage.getItem("token");
    if (!token) {
      setMsg({
        type: "error",
        text: "Không tìm thấy token. Vui lòng đăng nhập lại!",
      });
      return;
    }

    if (!aspiration.trim()) {
      setMsg({ type: "error", text: "Vui lòng nhập mục tiêu!" });
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        `${API_BASES.goal}/set`,
        { aspiration },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMsg({ type: "success", text: "Thiết lập mục tiêu thành công!" });
      setAspiration("");
    } catch (err) {
      console.error("Goal setting error:", err?.response?.data || err);
      const errorMsg =
        err?.response?.data?.detail || "Thiết lập mục tiêu thất bại!";
      setMsg({ type: "error", text: errorMsg });
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
        background: "linear-gradient(135deg, #f5f7fa, #c3cfe2)",
      }}
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
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
        <FlagIcon sx={{ fontSize: 32, color: "#ff9800" }} />
        Thiết lập mục tiêu
      </Typography>

      {/* Form nhập liệu */}
      <Box
        component="form"
        onSubmit={handleSetGoal}
        sx={{ display: "flex", flexDirection: "column", gap: 2 }}
      >
        <TextField
          label="Nhập mục tiêu nghề nghiệp"
          value={aspiration}
          onChange={(e) => setAspiration(e.target.value)}
          fullWidth
          required
          variant="outlined"
          sx={{
            background: "#fff",
            borderRadius: 2,
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: "#ddd" },
              "&:hover fieldset": { borderColor: "#1976d2" },
              "&.Mui-focused fieldset": { borderColor: "#1976d2" },
            },
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
          {loading ? <CircularProgress size={24} sx={{ color: "#fff" }} /> : "Thiết lập mục tiêu"}
        </Button>
      </Box>

      {/* Thông báo trạng thái */}
      {msg && (
        <Alert
          severity={msg.type}
          icon={msg.type === "success" ? <CheckCircleIcon /> : undefined}
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
    </Paper>
  );
}
