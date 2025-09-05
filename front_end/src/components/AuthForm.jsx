import React, { useState } from "react";
import { Box, TextField, Button, Typography, Alert, Paper } from "@mui/material";
import axios from "axios";
import qs from "qs";
import API_BASES from "../apiConfig";

export default function AuthForm({ onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setMsg(null);

    try {
      console.group("Login Attempt");
      console.log("Sending login request with:", { username, password });

      // Gửi request login
      const res = await axios.post(
        `${API_BASES.auth}/token`,
        qs.stringify({ username, password }),
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );

      console.log("Login response data:", res.data);

      // Lưu token
      localStorage.setItem("token", res.data.access_token);

      // **Không gọi /user/profile nữa**
      const userInfo = { username };

      setMsg({ type: "success", text: "Đăng nhập thành công!" });
      if (onLoginSuccess) onLoginSuccess(res.data.access_token, userInfo);

      console.groupEnd();
    } catch (err) {
      console.group("Login Error");
      console.error("Login error object:", err);
      if (err.response) {
        console.error("Login error status:", err.response.status);
        console.error("Login error data:", err.response.data);
      }
      console.groupEnd();
      setMsg({
        type: "error",
        text: "Sai tài khoản, mật khẩu hoặc lỗi server! Kiểm tra console để biết chi tiết.",
      });
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 4, maxWidth: 400, mx: "auto", mt: 4, borderRadius: 2 }}>
      <Typography variant="h5" gutterBottom align="center" color="primary">
        Đăng nhập
      </Typography>
      <Box component="form" onSubmit={handleLogin}>
        <TextField
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
        <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
          Đăng nhập
        </Button>
        {msg && <Alert severity={msg.type} sx={{ mt: 2 }}>{msg.text}</Alert>}
      </Box>
    </Paper>
  );
}
