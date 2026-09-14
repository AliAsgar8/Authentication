import React from "react";
import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { EmailVerify } from "./pages/EmailVerify";
import { ResertPassword } from "./pages/ResertPassword";

export const App = () => {
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/email-verify" element={<EmailVerify />} />
        <Route path="/reset-password" element={<ResertPassword />} />
      </Routes>
    </>
  );
};
