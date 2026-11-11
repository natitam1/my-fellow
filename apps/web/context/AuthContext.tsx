"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { api, getToken, setToken, removeToken } from "@/lib/api";

export interface User {
  id: string;
  _id?: string;
  fullName: string;
  phoneNumber: string;
  email?: string;
  role: "super_admin" | "admin" | "leader" | "editor" | "member";
  team?: string;
  department?: string;
  yearOfStudy?: string;
  profileImage?: string;
  bio?: string;
  telegramUserName?: string;
  streakCount?: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loginWithPassword: (phoneNumber: string, password: string) => Promise<any>;
  sendPhoneOtp: (phoneNumber: string) => Promise<any>;
  verifyPhoneOtp: (phoneNumber: string, code: string) => Promise<{ isNewUser?: boolean; user: User }>;
  logout: () => void;
  updateProfile: (data: Partial<User> | FormData) => Promise<User>;
  refreshUser: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async (): Promise<User | null> => {
    try {
      const activeToken = getToken();
      if (!activeToken) {
        setUser(null);
        setTokenState(null);
        setIsLoading(false);
        return null;
      }
      setTokenState(activeToken);
      const res = await api.get("/auth/me");
      const fetchedUser = res.data.data || res.data.user || res.data;
      setUser(fetchedUser);
      if (typeof window !== "undefined") {
        localStorage.setItem("fellow_user", JSON.stringify(fetchedUser));
      }
      return fetchedUser;
    } catch (err) {
      removeToken();
      setUser(null);
      setTokenState(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("fellow_user");
      if (cached) {
        try {
          setUser(JSON.parse(cached));
        } catch {
          // Ignore json parse error
        }
      }
    }
    refreshUser();
  }, []);

  const loginWithPassword = async (phoneNumber: string, password: string) => {
    const res = await api.post("/auth/signin", { phoneNumber, password });
    const data = res.data.data || res.data;
    const authToken = data.token;
    const authUser = data.user || data;
    setToken(authToken);
    setTokenState(authToken);
    setUser(authUser);
    if (typeof window !== "undefined") {
      localStorage.setItem("fellow_user", JSON.stringify(authUser));
    }
    return data;
  };

  const sendPhoneOtp = async (phoneNumber: string) => {
    const res = await api.post("/auth/phone/send-otp", { phoneNumber });
    return res.data;
  };

  const verifyPhoneOtp = async (phoneNumber: string, code: string) => {
    const res = await api.post("/auth/phone/verify-otp", { phoneNumber, code });
    const data = res.data.data || res.data;
    const authToken = data.token;
    const authUser = data.user || data;
    setToken(authToken);
    setTokenState(authToken);
    setUser(authUser);
    if (typeof window !== "undefined") {
      localStorage.setItem("fellow_user", JSON.stringify(authUser));
    }
    return { isNewUser: data.isNewUser, user: authUser };
  };

  const logout = () => {
    removeToken();
    setUser(null);
    setTokenState(null);
  };

  const updateProfile = async (data: Partial<User> | FormData): Promise<User> => {
    let res;
    try {
      res = await api.patch("/auth/profile", data);
    } catch {
      res = await api.put("/user/profile", data);
    }
    const updated = res.data.data || res.data.user || res.data;
    setUser(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("fellow_user", JSON.stringify(updated));
    }
    return updated;
  };

  const isAdmin = !!(user && (user.role === "admin" || user.role === "super_admin" || user.role === "leader"));

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        isAdmin,
        loginWithPassword,
        sendPhoneOtp,
        verifyPhoneOtp,
        logout,
        updateProfile,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
