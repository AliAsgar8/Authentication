import { createContext, useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../api/axios";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const getUserData = useCallback(async () => {
    try {
      const { data } = await api.get("/api/user/get-user");
      setUserData(data.user);
      setIsLoggedIn(true);
      return data.user;
    } catch {
      setUserData(null);
      setIsLoggedIn(false);
      return null;
    }
  }, []);

  const getAuthState = useCallback(async () => {
    try {
      await api.post("/api/auth/is-authenticated");
      await getUserData();
    } catch {
      setIsLoggedIn(false);
      setUserData(null);
    } finally {
      setLoading(false);
    }
  }, [getUserData]);

  const logout = useCallback(async () => {
    try {
      await api.post("/api/auth/logout");
      setIsLoggedIn(false);
      setUserData(null);
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Logout failed");
    }
  }, []);

  useEffect(() => {
    getAuthState();
  }, [getAuthState]);

  const value = {
    backendUrl,
    isLoggedIn,
    setIsLoggedIn,
    userData,
    setUserData,
    loading,
    getUserData,
    getAuthState,
    logout,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
