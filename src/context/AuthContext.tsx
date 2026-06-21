"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type UserRole = "admin" | "user" | "viewer" | null;

export interface AuthUser {
  username: string;
  role: UserRole;
}

interface AuthContextType {
  user: AuthUser | null;
  viewerCode: string;
  login: (username: string, password?: string) => boolean;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hardcoded presets
const PRESET_USERS = {
  admin: { password: "admin2026", role: "admin" as UserRole },
  htsmanager: { password: "hts2026", role: "admin" as UserRole },
  htsceo: { password: "ceo2026", role: "user" as UserRole },
};

const HARDCODED_VIEWER_CODE = "view2026";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from localStorage
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("auth_user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error("Failed to parse stored user", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (username: string, password?: string): boolean => {
    // Viewer login
    if (username === "viewer") {
      if (password === HARDCODED_VIEWER_CODE) {
        const viewerUser = { username: "Viewer", role: "viewer" as UserRole };
        setUser(viewerUser);
        localStorage.setItem("auth_user", JSON.stringify(viewerUser));
        return true;
      }
      return false;
    }

    // Admin/User login
    const normalizedUsername = username.toLowerCase().trim();
    const preset = PRESET_USERS[normalizedUsername as keyof typeof PRESET_USERS];

    if (preset && preset.password === password) {
      const authUser = { username: normalizedUsername, role: preset.role };
      setUser(authUser);
      localStorage.setItem("auth_user", JSON.stringify(authUser));
      return true;
    }

    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("auth_user");
    // Clear data so next login starts fresh
    localStorage.removeItem("dashboard_data");
  };

  return (
    <AuthContext.Provider value={{ user, viewerCode: HARDCODED_VIEWER_CODE, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
