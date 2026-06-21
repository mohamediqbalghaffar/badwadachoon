import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import AzureADProvider from "next-auth/providers/azure-ad";
import CredentialsProvider from "next-auth/providers/credentials";

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
        if (credentials?.code === "view2026") {
          return { id: "viewer", name: "Viewer", email: "viewer@badwadachoon.local", role: "viewer" };
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        // If logged in via credentials (viewer)
        if (user.id === "viewer") {
          token.role = "viewer";
          token.username = "Viewer";
        } else if (user.email) {
          // If logged in via OAuth
          const email = user.email.toLowerCase();
          if (email === "mohammed.iqbal@halabjagroup.com") {
            token.role = "admin";
            token.username = user.name || "Admin";
          } else if (email.endsWith("@halabjagroup.com")) {
            token.role = "user";
            token.username = user.name || "User";
          } else {
            // Default role for other authenticated emails (or could reject)
            token.role = "user";
            token.username = user.name || "User";
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).username = token.username;
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

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
