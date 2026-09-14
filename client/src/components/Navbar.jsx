import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { AppContext } from "../context/AppContext";

export const Navbar = () => {
  const navigate = useNavigate();
  const { isLoggedIn, userData, logout } = useContext(AppContext);

  return (
    <nav className="relative z-20 mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
      <Link to="/" className="animate-fade-up">
        <img src={assets.logo} alt="Auth logo" className="w-28 sm:w-32" />
      </Link>

      {isLoggedIn && userData ? (
        <div className="animate-fade-up flex items-center gap-3">
          {!userData.isAccountVerified && (
            <button
              type="button"
              onClick={() => navigate("/email-verify")}
              className="hidden rounded-full border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700 transition hover:-translate-y-0.5 sm:inline-flex"
            >
              Verify email
            </button>
          )}
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--brand)] text-sm font-semibold text-white uppercase">
            {userData.name?.[0] || "U"}
          </div>
          <button
            type="button"
            onClick={logout}
            className="cursor-pointer rounded-full border border-[#c9d3f0] bg-white/70 px-4 py-2 text-sm font-medium text-[var(--ink)] transition hover:border-[var(--brand-soft)]"
          >
            Logout
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="animate-fade-up group inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#c9d3f0] bg-white/70 px-5 py-2.5 text-sm font-medium text-[var(--ink)] shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--brand-soft)] hover:shadow-md"
        >
          Login
          <img
            src={assets.arrow_icon}
            alt=""
            className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
          />
        </button>
      )}
    </nav>
  );
};
