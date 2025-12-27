import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../../components/Config";
import Swal from "sweetalert2";

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
        timer: 1500,
      }).then(() =>
        navigate("/verify-otp", {
          state: {
            identifier,
            otpExpiresAt: otpExpires,
            type: payload.email ? "email" : "phone",
          },
        })
      );
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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold text-center text-gray-800 mb-6">Login with OTP</h2>

        <form onSubmit={handleGetOtp} className="space-y-4">
          {/* Email or Phone */}
          <div>
            <label
              htmlFor="identifier"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email or Phone Number
            </label>
            <input
              type="text"
              id="identifier"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
              focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              placeholder="Enter your email or phone number"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-2 px-4 rounded-md text-sm font-medium text-white bg-primary"
            disabled={loading}
          >
            {loading ? "Sending OTP..." : "Get OTP"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
