import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import AzureADProvider from "next-auth/providers/azure-ad";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID || "",
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET || "",
      tenantId: process.env.AZURE_AD_TENANT_ID || "common",
    }),
    CredentialsProvider({
      id: "viewer-login",
      name: "Viewer Code",
      credentials: {
        code: { label: "Code", type: "password" },
      },
      async authorize(credentials) {
        if (credentials?.code?.toLowerCase() === "view2026") {
          return { id: "viewer", name: "Viewer", email: "viewer@badwadachoon.local", role: "viewer" };
        }
        return null;
      },
    }),
    CredentialsProvider({
      id: "guest-login",
      name: "Guest",
      credentials: {},
      async authorize() {
        return { id: "guest", name: "Guest User", email: "guest@badwadachoon.local", role: "user" };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        if (user.id === "viewer") {
          token.role = "viewer";
          token.username = "Viewer";
          token.status = "active";
        } else if (user.id === "guest") {
          token.role = "user";
          token.username = "Guest User";
          token.status = "active";
        } else if (user.email) {
          const email = user.email.toLowerCase();
          
          let dbUser = await prisma.userAccount.findUnique({
            where: { email },
          });

          if (!dbUser) {
            let role = "user";
            let status = "pending";
            if (email === "mohammed.iqbal@halabjagroup.com") {
              role = "admin";
              status = "active";
            }

            const authCode = Math.random().toString(36).substring(2, 8).toUpperCase();
            dbUser = await prisma.userAccount.create({
              data: {
                email,
                name: user.name || "User",
                role,
                status,
                authCode
              }
            });
          }

          token.role = dbUser.role;
          token.status = dbUser.status;
          token.username = dbUser.name || "User";
          token.image = dbUser.image || user.image;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).status = token.status;
        (session.user as any).username = token.username;
        if (token.image) {
          (session.user as any).image = token.image;
        }
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
