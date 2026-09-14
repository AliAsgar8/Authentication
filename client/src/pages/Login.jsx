import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { assets } from "../assets/assets";
import { AppContext } from "../context/AppContext";
import api from "../api/axios";

export const Login = () => {
  const navigate = useNavigate();
  const { setIsLoggedIn, getUserData } = useContext(AppContext);
  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const isLogin = mode === "login";

  const onChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { data } = await api.post("/api/auth/login", {
          email: form.email,
          password: form.password,
        });
        setIsLoggedIn(true);
        await getUserData();
        toast.success(data.message || "Login successful");
        navigate("/");
      } else {
        const { data } = await api.post("/api/auth/register", {
          name: form.name,
          email: form.email,
          password: form.password,
        });
        setIsLoggedIn(true);
        await getUserData();
        toast.success(data.message || "Account created successfully");
        navigate("/email-verify");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
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
        <div className="glass-panel animate-fade-up w-full max-w-md rounded-3xl p-7 sm:p-9">
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.18em] text-[var(--brand-soft)]">
            {isLogin ? "Welcome back" : "Create account"}
          </p>
          <h1 className="display mb-2 text-3xl text-[var(--ink)] sm:text-4xl">
            {isLogin ? "Sign in" : "Join Auth"}
          </h1>
          <p className="mb-7 text-sm text-[var(--muted)]">
            {isLogin
              ? "Enter your credentials to continue to your dashboard."
              : "Set up your account in a few seconds and get started."}
          </p>

          <form onSubmit={onSubmit} className="space-y-4">
            {!isLogin && (
              <div className="relative animate-fade-up">
                <img
                  src={assets.person_icon}
                  alt=""
                  className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 opacity-60"
                />
                <input
                  className="input-field"
                  type="text"
                  name="name"
                  placeholder="Full name"
                  value={form.name}
                  onChange={onChange}
                  required={!isLogin}
                />
              </div>
            )}

            <div className="relative">
              <img
                src={assets.mail_icon}
                alt=""
                className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 opacity-60"
              />
              <input
                className="input-field"
                type="email"
                name="email"
                placeholder="Email address"
                value={form.email}
                onChange={onChange}
                required
              />
            </div>

            <div className="relative">
              <img
                src={assets.lock_icon}
                alt=""
                className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 opacity-60"
              />
              <input
                className="input-field"
                type="password"
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={onChange}
                required
              />
            </div>

            {isLogin && (
              <div className="flex justify-end">
                <Link
                  to="/reset-password"
                  className="text-sm font-medium text-[var(--brand)] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
            )}

            <button type="submit" className="btn-primary mt-2" disabled={loading}>
              {loading
                ? "Please wait..."
                : isLogin
                  ? "Login"
                  : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--muted)]">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => setMode(isLogin ? "signup" : "login")}
              className="cursor-pointer font-semibold text-[var(--brand)] hover:underline"
            >
              {isLogin ? "Sign up" : "Login"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
