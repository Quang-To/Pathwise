import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  Alert,
  CircularProgress,
  Paper,
  Stack,
  Divider
} from "@mui/material";
import { motion } from "framer-motion";
import axios from "axios";

export default function ExternalCourses({ user }) {
  const [courses, setCourses] = useState([]);
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchCourses = async () => {
    setMsg(null);
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/external-courses", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCourses(res.data.courses || []);
      setMsg({ type: "success", text: "Lấy danh sách khóa học thành công!" });
    } catch (err) {
      console.error("Fetch external courses error:", err);
      setMsg({ type: "error", text: "Không lấy được danh sách khóa học!" });
    } finally {
      setLoading(false);
    }
  };

  // Nếu user không phải admin -> hiển thị cảnh báo
  if (!user || user.role !== "admin") {
    return (
      <Paper
        elevation={4}
        sx={{
          p: 3,
          borderRadius: 3,
          maxWidth: 600,
          mx: "auto",
          mt: 4,
          background: "linear-gradient(135deg, #fff8f8, #ffeaea)",
          textAlign: "center"
        }}
        component={motion.div}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h5" color="error" sx={{ fontWeight: "bold", mb: 2 }}>
          Quyền truy cập bị từ chối
        </Typography>
        <Typography variant="body1" sx={{ color: "#555" }}>
          Tính năng này chỉ dành cho <strong>Admin</strong>.  
          Vui lòng liên hệ quản trị viên nếu bạn cần quyền truy cập.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={4}
      sx={{
        p: 3,
        borderRadius: 3,
        maxWidth: 700,
        mx: "auto",
        mt: 4,
        background: "linear-gradient(135deg, #f8fbff, #e3f2fd)"
      }}
      component={motion.div}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: "#1976d2" }}>
          Danh sách khóa học Coursera
        </Typography>
        <Button
          onClick={fetchCourses}
          variant="contained"
          disabled={loading}
          sx={{
            px: 3,
            borderRadius: 3,
            background: "linear-gradient(90deg, #1976d2, #2196f3)",
            "&:hover": {
              background: "linear-gradient(90deg, #1565c0, #1e88e5)"
            }
          }}
        >
          {loading ? <CircularProgress size={20} sx={{ color: "#fff" }} /> : "Lấy danh sách"}
        </Button>
      </Stack>

      {msg && (
        <Alert severity={msg.type} sx={{ mb: 2, borderRadius: 2 }}>
          {msg.text}
        </Alert>
      )}

      {/* Danh sách khóa học */}
      {loading ? (
        <Box sx={{ textAlign: "center", mt: 3 }}>
          <CircularProgress />
          <Typography variant="body2" sx={{ mt: 2, color: "text.secondary" }}>
            Đang tải danh sách khóa học...
          </Typography>
        </Box>
      ) : courses.length > 0 ? (
        <List
          sx={{
            bgcolor: "#fff",
            borderRadius: 2,
            boxShadow: 1,
            p: 2,
            maxHeight: 400,
            overflowY: "auto"
          }}
        >
          {courses.map((c, idx) => (
            <Box key={idx} sx={{ mb: 1 }}>
              <ListItem
                sx={{
                  borderRadius: 2,
                  bgcolor: "#f9f9f9",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  mb: 1
                }}
                component={motion.div}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ListItemText
                  primary={<Typography sx={{ fontWeight: 600 }}>{c.name || c.title || `Course ${idx + 1}`}</Typography>}
                  secondary={
                    <>
                      <Typography variant="body2" color="text.secondary">
                        ID: {c.id || "Không có ID"}
                      </Typography>
                      {c.description && (
                        <Typography variant="body2" color="text.secondary">
                          Mô tả: {c.description}
                        </Typography>
                      )}
                    </>
                  }
                />
              </ListItem>
              <Divider />
            </Box>
          ))}
        </List>
      ) : (
        <Typography
          variant="body2"
          sx={{ color: "text.secondary", textAlign: "center", mt: 3 }}
        >
          Chưa có khóa học nào được tải.
        </Typography>
      )}
    </Paper>
  );
}
