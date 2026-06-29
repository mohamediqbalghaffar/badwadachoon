"use client";

import React, { createContext, useContext } from "react";
import { SessionProvider, useSession, signOut } from "next-auth/react";
import { PermissionsProvider } from "./PermissionsContext";

export type UserRole = "admin" | "user" | "viewer" | null;

export interface AuthUser {
  username: string;
  role: UserRole;
  email?: string;
  status?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  viewerCode: string;
  logout: () => void;
  isLoading: boolean;
  updateSession: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const HARDCODED_VIEWER_CODE = "view2026";

const AuthStateProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status, update } = useSession();

  const isLoading = status === "loading";
  
  const user: AuthUser | null = session?.user ? {
    username: (session.user as any).username || session.user.name || "User",
    role: (session.user as any).role || "viewer",
    email: session.user.email || undefined,
    status: (session.user as any).status || "pending"
  } : null;

  const logout = async () => {
    localStorage.removeItem("dashboard_data"); // Clear cached data
    await signOut({ redirect: true, callbackUrl: "/" });
  };

  return (
    <AuthContext.Provider value={{ user, viewerCode: HARDCODED_VIEWER_CODE, logout, isLoading, updateSession: update }}>
      {children}
    </AuthContext.Provider>
  );
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider>
      <AuthStateProvider>
        <PermissionsProvider>
          {children}
        </PermissionsProvider>
      </AuthStateProvider>
    </SessionProvider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
