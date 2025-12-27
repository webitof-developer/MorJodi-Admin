import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import API_BASE_URL from "../../components/Config";
import Swal from "sweetalert2";
import  { jwtDecode }  from "jwt-decode"; 

const VerifyOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [otpDigits, setOtpDigits] = useState(new Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [otpExpiresAt, setOtpExpiresAt] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const [type, setType] = useState("email"); // email | phone
  const inputRefs = useRef([]);

  // ✅ load state (email/phone + expiry time)
  useEffect(() => {
    if (location.state && location.state.identifier) {
      setIdentifier(location.state.identifier);
      setType(location.state.type || "email");
      if (location.state.otpExpiresAt) {
        setOtpExpiresAt(location.state.otpExpiresAt);
      }
    } else {
      navigate("/login");
    }
  }, [location, navigate]);

  // ✅ countdown timer (2 min)
  useEffect(() => {
    let timer;
    if (otpExpiresAt) {
      timer = setInterval(() => {
        const now = Date.now();
        const expiryTime = new Date(otpExpiresAt).getTime();
        const remaining = Math.max(0, Math.floor((expiryTime - now) / 1000));
        setCountdown(remaining);

        if (remaining === 0) {
          clearInterval(timer);
          setCanResend(true);
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [otpExpiresAt]);

  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return false;
    const newOtpDigits = [...otpDigits];
    newOtpDigits[index] = element.value;
    setOtpDigits(newOtpDigits);
    if (element.nextSibling && element.value !== "") {
      element.nextSibling.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !e.target.value && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  // ✅ verify OTP (returns only token)
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    const otp = otpDigits.join("");

    try {
      const payload =
        type === "email"
          ? { email: identifier, otp }
          : { phoneNumber: identifier, otp };

      const response = await axios.post(
        `${API_BASE_URL}/api/user/login/verify-otp`,
        payload
      );

      // Expect backend returns { token }
      const { token } = response.data.data;

      if (!token) throw new Error("No token received from server");

      // Optional: decode token to check role if needed
      const decoded = jwtDecode(token);
      if (decoded.role !== "admin") {
        Swal.fire({
          icon: "error",
          title: "Access Denied!",
          text: "Only administrators can log in here.",
        });
        setLoading(false);
        return;
      }

      localStorage.setItem("authToken", token);

      Swal.fire({
        icon: "success",
        title: "Login Successful!",
        text: "Redirecting to dashboard...",
        showConfirmButton: false,
        timer: 1500,
      }).then(() => navigate("/dashboard"));
    } catch (err) {
      console.error("OTP Verification Error:", err.response?.data || err);
      Swal.fire({
        icon: "error",
        title: "OTP Verification Failed!",
        text: err.response?.data?.message || "Invalid or expired OTP.",
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ resend OTP
  const handleResendOtp = async () => {
    setLoading(true);
    try {
      const payload =
        type === "email"
          ? { email: identifier }
          : { phoneNumber: identifier };

      const response = await axios.post(
        `${API_BASE_URL}/api/user/login/request-otp`,
        payload
      );

      Swal.fire("Success", "New OTP sent!", "success");
      setOtpExpiresAt(response.data.otpExpires);
      setCanResend(false);
      setOtpDigits(new Array(6).fill(""));
      inputRefs.current[0].focus();
    } catch (err) {
      console.error("Resend OTP Error:", err.response?.data || err);
      Swal.fire({
        icon: "error",
        title: "Resend Failed!",
        text: err.response?.data?.message || "Could not resend OTP.",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold text-center text-gray-800 mb-6">
          Verify OTP
        </h2>

        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <p className="text-center text-gray-600">
            OTP sent to {type === "email" ? identifier : `+91 ${identifier}`}
          </p>

          <div className="flex justify-center gap-2 mb-4">
            {otpDigits.map((digit, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleOtpChange(e.target, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                ref={(el) => (inputRefs.current[index] = el)}
                className={`w-12 h-12 text-center text-2xl border-2 rounded-md shadow-sm 
                  ${digit ? "border-primary" : "border-gray-300"}
                  focus:outline-none  sm:text-sm`}
                required
                disabled={loading || countdown === 0}
              />
            ))}
          </div>

          {countdown > 0 ? (
            <p className="text-center text-sm text-gray-500">
              OTP expires in {formatTime(countdown)}
            </p>
          ) : (
            <p className="text-center text-sm text-red-500">
              OTP expired. Please resend.
            </p>
          )}

          <button
            type="submit"
            className="w-full py-2 px-4 rounded-md text-sm font-medium text-white bg-primary"
            disabled={loading || countdown === 0 || otpDigits.join("").length !== 6}
          >
            {loading ? "Verifying..." : "Verify OTP & Login"}
          </button>

          <button
            type="button"
            onClick={handleResendOtp}
            className="w-full py-2 px-4 mt-2 rounded-md text-sm font-medium text-primary border border-primary bg-white hover:bg-gray-50"
            disabled={loading || !canResend}
          >
            {loading ? "Sending new OTP..." : "Resend OTP"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyOtp;
