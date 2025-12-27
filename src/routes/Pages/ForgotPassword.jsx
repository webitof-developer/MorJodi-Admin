
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../../components/Config";
import Swal from "sweetalert2";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/api/otp/forgot-password-email`, {
        email,
      });
      setStep(2);
      Swal.fire({
        icon: "success",
        title: "OTP Sent!",
        text: "An OTP has been sent to your email address.",
        confirmButtonText: "OK",
      });
    } catch (err) {
      console.error("Forgot Password Error:", err.response?.data || err);
      Swal.fire({
        icon: "error",
        title: "Failed to Send OTP!",
        text: err.response?.data?.message || "Could not send OTP. Please try again.",
        confirmButtonText: "OK",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/api/otp/reset-password`, {
        email,
        otp,
        password,
      });
      Swal.fire({
        icon: "success",
        title: "Password Reset Successful!",
        text: "You can now log in with your new password.",
        showConfirmButton: false,
        timer: 2000,
      }).then(() => navigate("/"));
    } catch (err) {
      console.error("Reset Password Error:", err.response?.data || err);
      Swal.fire({
        icon: "error",
        title: "Failed to Reset Password!",
        text: err.response?.data?.message || "Invalid OTP or an error occurred.",
        confirmButtonText: "OK",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <h2 className="text-xl font-bold text-center text-gray-800 mb-6">Forgot Password</h2>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 px-4 rounded-md text-sm font-medium text-white bg-primary"
              disabled={loading}
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <h2 className="text-xl font-bold text-center text-gray-800 mb-6">Reset Password</h2>
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                OTP
              </label>
              <input
                type="text"
                id="otp"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                id="password"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 px-4 rounded-md text-sm font-medium text-white bg-primary"
              disabled={loading}
            >
              {loading ? "Resetting Password..." : "Reset Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
