"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User, CreateUserDto } from "@/types/user";
import { authApi } from "@/services/api";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: CreateUserDto) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user on mount - verify authentication with backend
  useEffect(() => {
    const loadUser = async () => {
      try {
        const profile = await authApi.getMe();
        setUser(profile);
      } catch (error: any) {
        // If 401, user is not authenticated
        if (error.response?.status === 401) {
          setUser(null);
        } else {
          // Network error - log it
          console.error("Error fetching user profile:", error);
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };

    loadUser();

    // Listen for logout events from interceptor
    const handleLogout = () => {
      setUser(null);
    };

    window.addEventListener("auth:logout", handleLogout);

    return () => {
      window.removeEventListener("auth:logout", handleLogout);
    };
  }, []); // Only run once on mount

  const login = async (email: string, password: string) => {
    const response = await authApi.login({ email, password });
    setUser(response.user);
  };

  const register = async (userData: CreateUserDto) => {
    const response = await authApi.register(userData);
    setUser(response.user);
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
