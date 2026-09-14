import React, { useContext, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { assets } from "../assets/assets";
import { AppContext } from "../context/AppContext";
import api from "../api/axios";

export const EmailVerify = () => {
  const navigate = useNavigate();
  const { isLoggedIn, userData, getUserData, loading } = useContext(AppContext);
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [submitting, setSubmitting] = useState(false);
  const [sending, setSending] = useState(false);
  const inputsRef = useRef([]);
  const sentRef = useRef(false);


  const sendOtp = async () => {
    setSending(true);
    try {
      const { data } = await api.post("/api/auth/send-otp-for-verification");
      toast.success(data.message || "OTP sent to your email");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    if (loading) return;

    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    if (userData?.isAccountVerified) {
      navigate("/");
      return;
    }

    if (!sentRef.current) {
      sentRef.current = true;
      sendOtp();
    }
  }, [loading, isLoggedIn, userData, navigate]);

  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const next = [...otp];
    next[index] = value;
    setOtp(next);

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
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

  const onSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join("");

    if (code.length !== 6) {
      toast.error("Please enter the complete 6-digit OTP");
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await api.post("/api/auth/verify-otp-for-verification", {
        otp: code,
      });
      await getUserData();
      toast.success(data.message || "Email verified successfully");
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Verification failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-shell flex min-h-screen flex-col">
      <div className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <Link to="/">
          <img src={assets.logo} alt="Auth logo" className="w-28 sm:w-32" />
        </Link>
        <Link
          to="/"
          className="text-sm font-medium text-[var(--muted)] transition hover:text-[var(--brand)]"
        >
          Back to home
        </Link>
      </div>

      <div className="relative z-10 flex flex-1 items-center justify-center px-5 pb-12">
        <div className="glass-panel animate-fade-up w-full max-w-md rounded-3xl p-7 text-center sm:p-9">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--sky)]">
            <img src={assets.mail_icon} alt="" className="h-6 w-6 opacity-80" />
          </div>

          <h1 className="display mb-2 text-3xl text-[var(--ink)] sm:text-4xl">
            Verify email
          </h1>
          <p className="mb-8 text-sm text-[var(--muted)]">
            Enter the 6-digit code sent to{" "}
            <span className="font-medium text-[var(--ink)]">
              {userData?.email || "your email"}
            </span>
            .
          </p>

          <form onSubmit={onSubmit}> 
            <div
              className="mb-7 flex justify-center gap-2 sm:gap-3"
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

            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? "Verifying..." : "Verify email"}
            </button>
          </form>

          <p className="mt-6 text-sm text-[var(--muted)]">
            Didn&apos;t get the code?{" "}
            <button
              type="button"
              onClick={sendOtp}
              disabled={sending}
              className="cursor-pointer font-semibold text-[var(--brand)] hover:underline disabled:opacity-60"
            >
              {sending ? "Sending..." : "Resend OTP"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
