import React, { useState } from "react";
import { send } from "emailjs-com";
import {
  TextField,
  Button,
  Container,
  Typography,
  Paper,
  Box,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const AuthContext = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtpField, setShowOtpField] = useState(false);
  const [isRegistering, setIsRegistering] = useState(true);
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Generate a random OTP
  const generateOtp = () => Math.floor(100000 + Math.random() * 900000);

  // Function to send OTP to email
  const sendOtp = (email: string) => {
    if (!/\S+@\S+\.\S+/.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    console.log(`OTP sent to: ${email}`);
    const newOtp = generateOtp();
    setGeneratedOtp(newOtp.toString());

    try {
      send(
        process.env.REACT_APP_EMAILJS_SERVICE_ID,
        process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
        {
          to_email: email,
          otp: newOtp,
        },
        process.env.REACT_APP_EMAILJS_USER_ID
      ).then(() => {
        setShowOtpField(true); // Show OTP input field after sending OTP
      }).catch((error) => {
        console.error("Error sending OTP:", error);
        alert("Error sending OTP. Please try again.");
      });
    } catch (error) {
      console.error("Unexpected error while sending OTP:", error);
      alert("An error occurred. Please try again later.");
    }
  };

  // Function to verify OTP entered by user
  const verifyOtp = async (otp: string) => {
    if (otp === generatedOtp) {
      alert(isRegistering ? "Registration successful!" : "Login successful!");
      navigate("/dashboard"); // Redirect to the dashboard
      resetForm();
    } else {
      alert("Invalid OTP. Please try again.");
    }
  };

  // Handle form submission for sending OTP
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    sendOtp(email); // Send OTP to the email
    setLoading(false);
  };

  // Handle OTP form submission
  const handleOtpSubmit = (e) => {
    e.preventDefault();
    verifyOtp(otp); // Verify the entered OTP
  };

  // Reset form state
  const resetForm = () => {
    setEmail("");
    setPassword("");
    setOtp("");
    setShowOtpField(false);
    setGeneratedOtp("");
  };

  return (
    <Container maxWidth="xs">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Typography variant="h4" gutterBottom align="center">
          {isRegistering ? "Register" : "Login"}
        </Typography>

        {!showOtpField ? (
          <form onSubmit={handleEmailSubmit}>
            <TextField
              label="Email"
              type="email"
              fullWidth
              required
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {isRegistering && (
              <TextField
                label="Password"
                type="password"
                fullWidth
                required
                margin="normal"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            )}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 2 }}
              disabled={loading}
            >
              {loading ? "Sending..." : "Send OTP"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit}>
            <TextField
              label="Enter OTP"
              type="number"
              fullWidth
              required
              margin="normal"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 2 }}
            >
              Verify OTP
            </Button>
          </form>
        )}

        <Box sx={{ mt: 2, textAlign: "center" }}>
          <Button
            onClick={() => {
              resetForm();
              setIsRegistering(!isRegistering);
            }}
          >
            {isRegistering
              ? "Already have an account? Login"
              : "Don't have an account? Register"}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default AuthContext;
