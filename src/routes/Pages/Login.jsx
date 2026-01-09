import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../../components/Config";
import Swal from "/src/utils/swalTheme";

const Login = () => {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState(""); // email or phone
  const [loading, setLoading] = useState(false);

  const handleGetOtp = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // detect if it's email or phone
      const payload = identifier.includes("@")
        ? { email: identifier }
        : { phoneNumber: identifier };

      // ✅ updated API route (backend new route)
      const res = await axios.post(`${API_BASE_URL}/api/user/login/request-otp`, payload);

      const { otpExpires } = res.data;

      Swal.fire({
        icon: "success",
        title: "OTP Sent!",
        text: "An OTP has been sent successfully.",
        showConfirmButton: false,
        timer: 900,
        timerProgressBar: true,
      });

      navigate("/verify-otp", {
        state: {
          identifier,
          otpExpiresAt: otpExpires,
          type: payload.email ? "email" : "phone",
        },
      });
    } catch (err) {
      console.error("OTP Error:", err.response?.data || err);
      Swal.fire({
        icon: "error",
        title: "Failed to send OTP",
        text: err.response?.data?.message || "Please check your input and try again.",
        confirmButtonText: "OK",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-10 flex items-center justify-center">
      <div className="pointer-events-none absolute -left-20 top-10 h-72 w-72 rounded-full bg-primary opacity-20 blur-3xl animate-float-slow" />
      <div className="pointer-events-none absolute -right-16 bottom-0 h-64 w-64 rounded-full bg-primary-light opacity-30 blur-3xl animate-float-fast" />

      <div className="relative mx-auto w-full max-w-5xl">
        <div className="grid w-full overflow-hidden rounded-3xl border border-white/10 bg-[#f8f9fa] shadow-sm/10 shadow-2xl backdrop-blur-2xl md:grid-cols-2 animate-rise">
          <div className="hidden flex-col justify-between bg-gradient-to-br from-primary to-primary-light p-10 text-white md:flex">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-white/30 bg-[#f8f9fa] shadow-sm/15 animate-pop">
                <img src="/FavIcon.png" alt="Mor Jodi logo" className="h-full w-full object-contain" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/70">Mor Jodi</p>
                <p className="text-xl font-semibold">Admin Console</p>
              </div>
            </div>

            <div className="mt-16 space-y-4">
              <h1 className="text-3xl font-semibold leading-tight">Secure access, simplified.</h1>
              <p className="text-sm text-white/80">
                Manage users, content, and settings from a refined, distraction-free workspace.
                OTP login keeps your account protected with minimal friction.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3 text-sm text-white/80">
              <div className="rounded-2xl border border-white/20 bg-[#f8f9fa] shadow-sm/10 p-4">
                <p className="text-xs uppercase tracking-wide text-white/60">Reliability</p>
                <p className="mt-2 font-semibold">99.9% uptime</p>
              </div>
              <div className="rounded-2xl border border-white/20 bg-[#f8f9fa] shadow-sm/10 p-4">
                <p className="text-xs uppercase tracking-wide text-white/60">Support</p>
                <p className="mt-2 font-semibold">24/7 priority</p>
              </div>
            </div>
          </div>

          <div className="bg-[#f8f9fa] shadow-sm/90 p-8 backdrop-blur-xl sm:p-10">
            <div className="mb-8 space-y-2 animate-fade-delay">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                Admin Access
              </p>
              <h2 className="text-2xl font-semibold text-slate-900">Sign in with OTP</h2>
              <p className="text-sm text-slate-600">
                Enter your registered email or phone number to receive a one-time passcode.
              </p>
            </div>

            <form onSubmit={handleGetOtp} className="space-y-6">
              <div className="space-y-2">
                <label
                  htmlFor="identifier"
                  className="block text-sm font-medium text-slate-700"
                >
                  Email or Phone Number
                </label>
                <input
                  type="text"
                  id="identifier"
                  className="w-full rounded-xl border border-slate-200 bg-[#f8f9fa] shadow-sm/80 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
                  placeholder="you@example.com or +91 98765 43210"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-light px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition hover:translate-y-0.5 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={loading}
              >
                {loading ? "Sending OTP..." : "Send secure OTP"}
              </button>
            </form>

            <div className="mt-6 flex items-center justify-between text-xs text-slate-500">
              <span>OTP arrives within a few seconds.</span>
              <a className="font-semibold text-primary hover:text-primary-light" href="mailto:support@morjodi.com">
                Need help?
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;


