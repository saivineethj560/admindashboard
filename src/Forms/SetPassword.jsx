import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  Box, TextField, Button, Typography, InputAdornment, IconButton, Paper, Alert
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { IMAGE_PATH, API_BASE_URL } from "../Config";

const SetPassword = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({ 
    username: "", 
    password: "",
    confirmPassword: "" 
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [focusedField, setFocusedField] = useState("");
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Get username from navigation state
    if (location.state?.username) {
      setFormData(prev => ({ ...prev, username: location.state.username }));
    } else {
      // If no username in state, redirect to login
      navigate('/login');
    }
  }, [location, navigate]);

  const handleTogglePassword = () => setShowPassword(!showPassword);
  const handleToggleConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long!");
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}setPassword`,
        {
          username: formData.username,
          password: formData.password
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          }
        }
      );

      if (response.data.success) {
        setSuccess("Password set successfully! Redirecting to login...");
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (error) {
      console.error("Set password error:", error);
      if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError("Failed to set password. Please try again.");
      }
    }
  };

  return (
    <Box
      position="relative"
      width="100vw"
      height="100vh"
      overflow="hidden"
    >
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          objectFit: "cover",
          top: 0,
          left: 0,
          zIndex: -2,
        }}
      >
        <source src={`${IMAGE_PATH}/bg.mp4`} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Dark Overlay */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: -1,
        }}
      />

      {/* Set Password Form */}
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100%"
      >
        <Paper
          elevation={0}
          sx={{
            p: 3,
            width: 380,
            borderRadius: 3,
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(8px)',
            color: '#fff',
            boxShadow: `
              0 0 8px rgba(255, 255, 255, 0.6),
              0 0 16px rgba(255, 255, 255, 0.4),
              0 0 24px rgba(255, 255, 255, 0.2)
            `
          }}
        >
          {/* Panda GIF */}
          <Box display="flex" justifyContent="center" mb={2}>
            <img
              src={focusedField === "password" || focusedField === "confirmPassword" 
                ? `${IMAGE_PATH}/panda-closed.gif` 
                : `${IMAGE_PATH}/panda-open.gif`}
              alt="Panda"
              style={{ width: 80, height: 80 }}
            />
          </Box>

          <Typography 
            variant="h5" 
            textAlign="center" 
            mb={2} 
            sx={{ fontWeight: 600 }}
          >
            Set Your Password
          </Typography>

          <Typography 
            textAlign="center" 
            mb={3} 
            sx={{ fontSize: "0.875rem", opacity: 0.9 }}
          >
            Please set a password for your account
          </Typography>

          {/* Success/Error Messages */}
          {success && (
            <Alert severity="success" sx={{ mb: 2, backgroundColor: 'rgba(76, 175, 80, 0.2)' }}>
              {success}
            </Alert>
          )}
          
          {error && (
            <Alert severity="error" sx={{ mb: 2, backgroundColor: 'rgba(244, 67, 54, 0.2)' }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              margin="normal"
              label="Username"
              name="username"
              type="text"
              value={formData.username}
              readonly
              InputLabelProps={{ style: { color: '#fff' } }}
              InputProps={{
                style: { color: '#fff' },
              }}
            />

            <TextField
              fullWidth
              margin="normal"
              label="New Password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              onFocus={() => setFocusedField("password")}
              onBlur={() => setFocusedField("")}
              required
              InputLabelProps={{ style: { color: '#fff' } }}
              InputProps={{
                style: { color: '#fff' },
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleTogglePassword} edge="end" sx={{ color: '#fff' }}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              margin="normal"
              label="Confirm Password"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={handleChange}
              onFocus={() => setFocusedField("confirmPassword")}
              onBlur={() => setFocusedField("")}
              required
              InputLabelProps={{ style: { color: '#fff' } }}
              InputProps={{
                style: { color: '#fff' },
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleToggleConfirmPassword} edge="end" sx={{ color: '#fff' }}>
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Box display="flex" justifyContent="center" mt={4}>
              <Button
                type="submit"
                variant="contained"
                sx={{
                  px: 5,
                  py: 1.2,
                  bgcolor: "primary.main",
                  width: 180,
                  boxShadow: '0px 0px 12px rgba(255,255,255,0.6)',
                  '&:hover': {
                    boxShadow: '0px 0px 20px rgba(255,255,255,0.9)',
                    bgcolor: "primary.dark",
                  },
                }}
              >
                Set Password
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
    </Box>
  );
};

export default SetPassword;