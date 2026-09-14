import React from "react";
import { Navbar } from "../components/Navbar";
import { Header } from "../components/Header";

export const Home = () => {
  return (
    <div className="auth-shell">
      <Navbar />
      <Header />
    </div>
  );
};
