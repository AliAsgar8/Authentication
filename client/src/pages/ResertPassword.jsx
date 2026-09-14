import React, { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { assets } from "../assets/assets";
import api from "../api/axios";

export const ResertPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState(Array(6).fill(""));
  const inputsRef = useRef([]);

  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 5) inputsRef.current[index + 1]?.focus();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (!pasted) return;
    const next = Array(6).fill("");
    pasted.split("").forEach((digit, i) => {
      next[i] = digit;
    });
    setOtp(next);
    inputsRef.current[Math.min(pasted.length, 5)]?.focus();
  };

  const onContinue = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (step === 1) {
        const { data } = await api.post("/api/auth/send-reset-otp", { email });
        toast.success(data.message || "Reset OTP sent to your email");
        setStep(2);
      } else if (step === 2) {
        const code = otp.join("");
        if (code.length !== 6) {
          toast.error("Please enter the complete 6-digit OTP");
          return;
        }

        const { data } = await api.post("/api/auth/check-reset-otp", {
          email,
          otp: code,
        });

        toast.success(data.message || "OTP verified successfully");
        setStep(3);
      } else {
        const code = otp.join("");
        if (!password || password.length < 6) {
          toast.error("Password must be at least 6 characters");
          return;
        }

        const { data } = await api.post("/api/auth/verify-reset-otp", {
          email,
          otp: code,
          newPassword: password,
        });

        toast.success(data.message || "Password reset successfully");
        navigate("/login");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const titles = {
    1: "Forgot password",
    2: "Enter OTP",
    3: "New password",
  };

  const descriptions = {
    1: "Enter your account email and we’ll send a reset code.",
    2: "Type the 6-digit verification code from your inbox.",
    3: "Choose a strong new password for your account.",
  };

  return (
    <div className="auth-shell flex min-h-screen flex-col">
      <div className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <Link to="/">
          <img src={assets.logo} alt="Auth logo" className="w-28 sm:w-32" />
        </Link>
        <Link
          to="/login"
          className="text-sm font-medium text-[var(--muted)] transition hover:text-[var(--brand)]"
        >
          Back to login
        </Link>
      </div>

      <div className="relative z-10 flex flex-1 items-center justify-center px-5 pb-12">
        <div className="glass-panel animate-fade-up w-full max-w-md rounded-3xl p-7 sm:p-9">
          <div className="mb-6 flex gap-2">
            {[1, 2, 3].map((item) => (
              <span
                key={item}
                className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                  item <= step ? "bg-[var(--brand)]" : "bg-[#dfe6f7]"
                }`}
              />
            ))}
          </div>

          <p className="mb-2 text-sm font-medium uppercase tracking-[0.18em] text-[var(--brand-soft)]">
            Step {step} of 3
          </p>
          <h1 className="display mb-2 text-3xl text-[var(--ink)] sm:text-4xl">
            {titles[step]}
          </h1>
          <p className="mb-7 text-sm text-[var(--muted)]">{descriptions[step]}</p>

          <form onSubmit={onContinue} className="space-y-4">
            {step === 1 && (
              <div className="relative">
                <img
                  src={assets.mail_icon}
                  alt=""
                  className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 opacity-60"
                />
                <input
                  className="input-field"
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            )}

            {step === 2 && (
              <div
                className="flex justify-center gap-2 sm:gap-3"
                onPaste={handlePaste}
              >
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputsRef.current[index] = el)}
                    className="otp-box"
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(e.target.value, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                  />
                ))}
              </div>
            )}

            {step === 3 && (
              <div className="relative">
                <img
                  src={assets.lock_icon}
                  alt=""
                  className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 opacity-60"
                />
                <input
                  className="input-field"
                  type="password"
                  placeholder="New password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  required
                />
              </div>
            )}

            <button type="submit" className="btn-primary mt-2" disabled={loading}>
              {loading
                ? "Please wait..."
                : step === 3
                  ? "Reset password"
                  : "Continue"}
            </button>
          </form>

          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="mt-4 w-full cursor-pointer text-sm font-medium text-[var(--muted)] hover:text-[var(--brand)]"
            >
              Back
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
