import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import API_BASE_URL from "../../components/Config";
import Swal from "/src/utils/swalTheme";
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
    const completed = newOtpDigits.join("");
    if (completed.length === 6 && !completed.includes("") && countdown > 0 && !loading) {
      handleVerifyOtp(null, newOtpDigits);
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !e.target.value && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;

    const newOtp = new Array(6).fill("");
    for (let i = 0; i < pasted.length; i += 1) {
      newOtp[i] = pasted[i];
    }
    setOtpDigits(newOtp);

    // Focus the next available box or stay on the last one when full
    const nextIndex = Math.min(pasted.length, 5);
    if (inputRefs.current[nextIndex]) {
      inputRefs.current[nextIndex].focus();
    }

    if (pasted.length === 6 && countdown > 0 && !loading) {
      handleVerifyOtp(null, newOtp);
    }
  };

  // ✅ verify OTP (returns only token)
  const handleVerifyOtp = async (e, digitsOverride) => {
    if (e) e.preventDefault();
    setLoading(true);
    const otpArray = digitsOverride || otpDigits;
    const otp = otpArray.join("");

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
        timer: 900,
        timerProgressBar: true,
      });
      navigate("/dashboard");
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

      Swal.fire({
        icon: "success",
        title: "New OTP sent!",
        text: "Check your inbox for the fresh code.",
        showConfirmButton: false,
        timer: 900,
        timerProgressBar: true,
      });
      setOtpExpiresAt(response.data.otpExpires);
      setCanResend(false);
      setOtpDigits(new Array(6).fill(""));
      inputRefs.current[0].focus();
    } catch (err) {
      console.error("Resend OTP Error:", err.response?.data || err);
      Swal.fire({
        ...swalStyles,
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
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-10 flex items-center justify-center">
      <div className="pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full bg-primary opacity-20 blur-3xl animate-float-slow" />
      <div className="pointer-events-none absolute -right-16 bottom-10 h-64 w-64 rounded-full bg-primary-light opacity-30 blur-3xl animate-float-fast" />

      <div className="relative mx-auto w-full max-w-5xl">
        <div className="grid w-full overflow-hidden rounded-3xl border border-white/10 bg-[#f8f9fa] shadow-sm/10 shadow-2xl backdrop-blur-2xl md:grid-cols-2 animate-rise">
          <div className="hidden flex-col justify-between bg-gradient-to-br from-primary to-primary-light p-10 text-white md:flex">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-white/30 bg-[#f8f9fa] shadow-sm/15 animate-pop">
                <img src="/FavIcon.png" alt="Mor Jodi logo" className="h-full w-full object-contain" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/70">Mor Jodi</p>
                <p className="text-xl font-semibold">Secure Access</p>
              </div>
            </div>

            <div className="mt-16 space-y-3">
              <h1 className="text-3xl font-semibold leading-tight">Enter the one-time code.</h1>
              <p className="text-sm text-white/80">
                For your protection this code expires quickly. Keep the window open while you verify.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-3 text-sm text-white/80">
              <div className="rounded-2xl border border-white/25 bg-[#f8f9fa] shadow-sm/10 p-4">
                <p className="text-xs uppercase tracking-wide text-white/60">Destination</p>
                <p className="mt-2 font-semibold break-words">{type === "email" ? identifier : `+91 ${identifier}`}</p>
              </div>
              <div className="rounded-2xl border border-white/25 bg-[#f8f9fa] shadow-sm/10 p-4">
                <p className="text-xs uppercase tracking-wide text-white/60">Time left</p>
                <p className="mt-2 font-semibold">{countdown > 0 ? formatTime(countdown) : "Expired"}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#f8f9fa] shadow-sm/90 p-8 backdrop-blur-xl sm:p-10">
            <div className="mb-6 space-y-2 animate-fade-delay">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                Verify OTP
              </p>
              <h2 className="text-2xl font-semibold text-slate-900">Complete your sign-in</h2>
              <p className="text-sm text-slate-600">
                Enter the 6-digit code sent to {type === "email" ? identifier : `+91 ${identifier}`}.
              </p>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="flex justify-center gap-3">
                {otpDigits.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleOtpChange(e.target, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    onPaste={handlePaste}
                    ref={(el) => (inputRefs.current[index] = el)}
                    className={`h-12 w-12 rounded-xl border text-center text-xl font-semibold shadow-sm transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60 ${digit ? "border-primary bg-primary/5 text-primary" : "border-slate-200 bg-[#f8f9fa] shadow-sm/80 text-slate-900"}`}
                    required
                    disabled={loading || countdown === 0}
                  />
                ))}
              </div>

              {countdown > 0 ? (
                <p className="text-center text-sm text-slate-600">
                  Code expires in <span className="font-semibold text-primary">{formatTime(countdown)}</span>
                </p>
              ) : (
                <p className="text-center text-sm text-red-500 font-medium">
                  OTP expired. Request a new code.
                </p>
              )}

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-light px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition hover:translate-y-0.5 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={loading || countdown === 0 || otpDigits.join("").length !== 6}
              >
                {loading ? "Verifying..." : "Verify & Continue"}
              </button>

              <button
                type="button"
                onClick={handleResendOtp}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-primary/40 bg-[#f8f9fa] shadow-sm px-4 py-3 text-sm font-semibold text-primary transition hover:-translate-y-0.5 hover:border-primary hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={loading || !canResend}
              >
                {loading ? "Sending new OTP..." : "Send a new code"}
              </button>

              <div className="text-center text-xs text-slate-500">
                Trouble? <a className="font-semibold text-primary hover:text-primary-light" href="mailto:support@morjodi.com">Contact support</a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;


