"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { api, getToken, setToken, removeToken } from "@/lib/api";

export interface User {
  id: string;
  _id?: string;
  fullName: string;
  name?: string;
  phoneNumber: string;
  email?: string;
  role: "super_admin" | "admin" | "leader" | "editor" | "member";
  team?: string;
  department?: string;
  yearOfStudy?: string;
  year?: string;
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
  login: (phoneNumber: string, password: string) => Promise<any>;
  loginWithPassword: (phoneNumber: string, password: string) => Promise<any>;
  sendPhoneOtp: (phoneNumber: string) => Promise<any>;
  verifyPhoneOtp: (phoneNumber: string, code: string) => Promise<{ isNewUser?: boolean; user: User }>;
  logout: () => void;
  updateProfile: (data: Partial<User> | FormData) => Promise<User>;
  updateUser: (data: Partial<User> | FormData) => Promise<User>;
  refreshUser: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async (): Promise<User | null> => {
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
  }, []);

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
  }, [refreshUser]);

  const loginWithPassword = useCallback(async (phoneNumber: string, password: string) => {
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
  }, []);

  const login = loginWithPassword;

  const sendPhoneOtp = useCallback(async (phoneNumber: string) => {
    const res = await api.post("/auth/phone/send-otp", { phoneNumber });
    return res.data;
  }, []);

  const verifyPhoneOtp = useCallback(async (phoneNumber: string, code: string) => {
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
  }, []);

  const logout = useCallback(() => {
    removeToken();
    if (typeof window !== "undefined") {
      localStorage.removeItem("admin_demo_session");
      localStorage.removeItem("admin_demo_mode");
      localStorage.removeItem("fellow_user");
      localStorage.removeItem("admin_user");
      localStorage.removeItem("token");
    }
    setUser(null);
    setTokenState(null);
  }, []);

  const updateProfile = useCallback(async (data: Partial<User> | FormData): Promise<User> => {
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
  }, []);

  const updateUser = updateProfile;

  const isAuthenticated = !!user;
  const isAdmin = !!(user && (user.role === "admin" || user.role === "super_admin" || user.role === "leader"));

  const contextValue = useMemo(
    () => ({
      user,
      token,
      isAuthenticated,
      isLoading,
      isAdmin,
      login,
      loginWithPassword,
      sendPhoneOtp,
      verifyPhoneOtp,
      logout,
      refreshUser,
      updateProfile,
      updateUser,
    }),
    [
      user,
      token,
      isAuthenticated,
      isLoading,
      isAdmin,
      login,
      loginWithPassword,
      sendPhoneOtp,
      verifyPhoneOtp,
      logout,
      refreshUser,
      updateProfile,
      updateUser,
    ],
  );

  return (
    <AuthContext.Provider value={contextValue}>
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
