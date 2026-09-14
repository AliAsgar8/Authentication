import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { AppContext } from "../context/AppContext";

export const Header = () => {
  const navigate = useNavigate();
  const { isLoggedIn, userData } = useContext(AppContext);

  return (
    <header className="relative z-10 mx-auto flex min-h-[calc(100vh-88px)] w-full max-w-6xl flex-col items-center justify-center px-5 pb-16 pt-6 text-center sm:px-8">
      <div className="animate-float relative mb-8">
        <span className="absolute inset-0 m-auto h-40 w-40 rounded-full bg-[var(--glow)] blur-2xl" />
        <span className="pointer-events-none absolute inset-0 m-auto h-44 w-44 animate-[pulse-ring_2.8s_ease-out_infinite] rounded-full border border-[var(--brand-soft)]/30" />
        <img
          src={assets.header_img}
          alt="Developer profile"
          className="relative mx-auto h-28 w-28 rounded-full object-cover shadow-[0_18px_40px_rgba(30,40,255,0.25)] ring-4 ring-white sm:h-32 sm:w-32"
        />
      </div>

      <h1 className="display animate-fade-up mb-3 text-4xl leading-tight text-[var(--ink)] sm:text-5xl md:text-6xl">
        Hey {userData?.name || "Developer"}{" "}
        <img
          src={assets.hand_wave}
          alt=""
          className="animate-wave ml-1 inline-block h-9 w-9 align-middle sm:h-11 sm:w-11"
        />
      </h1>

      <p className="animate-fade-up-delay mx-auto mb-8 max-w-xl text-base text-[var(--muted)] sm:text-lg">
        {isLoggedIn
          ? userData?.isAccountVerified
            ? "Your account is verified. You’re all set to explore the app."
            : "Please verify your email to fully secure your account."
          : "Welcome to a clean authentication experience — register, verify your email, and reset passwords with a smooth modern UI."}
      </p>

      <div className="animate-fade-up-delay-2 flex flex-wrap items-center justify-center gap-3">
        {isLoggedIn ? (
          !userData?.isAccountVerified ? (
            <button
              type="button"
              onClick={() => navigate("/email-verify")}
              className="btn-primary !w-auto px-8"
            >
              Verify email
            </button>
          ) : (
            <button
              type="button"
              className="rounded-full border border-emerald-200 bg-emerald-50 px-7 py-3 text-sm font-semibold text-emerald-700"
            >
              Email verified
            </button>
          )
        ) : (
          <>
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="btn-primary !w-auto px-8"
            >
              Get Started
            </button>
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="rounded-full border border-[#c9d3f0] bg-white/70 px-7 py-3 text-sm font-medium text-[var(--ink)] backdrop-blur transition hover:-translate-y-0.5 hover:border-[var(--brand-soft)]"
            >
              Explore Login
            </button>
          </>
        )}
      </div>
    </header>
  );
};
