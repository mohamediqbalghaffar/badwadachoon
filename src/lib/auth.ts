import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import AzureADProvider from "next-auth/providers/azure-ad";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";

const PRESET_USERS: Record<string, { password: string; role: string; name: string }> = {
  admin: { password: "admin2026", role: "admin", name: "Admin" },
  htsmanager: { password: "hts2026", role: "admin", name: "HTS Manager" },
  htsceo: { password: "ceo2026", role: "admin", name: "HTS CEO" },
  user: { password: "user2026", role: "user", name: "User" },
};

const ADMIN_EMAILS = [
  "mohammed.iqbal@halabjagroup.com",
  "moham_iqbal99@gmail.com",
  "admin@badwadachoon.local"
];

const providers: any[] = [
  CredentialsProvider({
    id: "local-admin",
    name: "Local Admin",
    credentials: {
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (credentials?.password === "admin2026") {
        return {
          id: "local-admin",
          name: "Mohammed Iqbal",
          email: "admin@badwadachoon.local",
          role: "admin",
        };
      }
      return null;
    },
  }),
  CredentialsProvider({
    id: "staff-login",
    name: "Staff Credentials",
    credentials: {
      username: { label: "Username", type: "text" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.username || !credentials?.password) return null;
      const username = credentials.username.toLowerCase().trim();
      const password = credentials.password.trim();

      const preset = PRESET_USERS[username];
      if (preset && preset.password === password) {
        return {
          id: `staff-${username}`,
          name: preset.name,
          email: `${username}@badwadachoon.local`,
          role: preset.role,
        };
      }

      // Generic admin fallback
      if ((username === "admin" || username === "hts") && password === "admin2026") {
        return {
          id: "staff-admin",
          name: "Admin",
          email: "admin@badwadachoon.local",
          role: "admin",
        };
      }

      return null;
    },
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
      return { id: "guest", name: "Guest User", email: "guest@badwadachoon.local", role: "guest" };
    },
  }),
  CredentialsProvider({
    id: "email-login",
    name: "Email Login",
    credentials: {
      email: { label: "Email", type: "email" },
    },
    async authorize(credentials) {
      if (!credentials?.email) return null;
      
      const email = credentials.email.toLowerCase().trim();
      const isAdmin = ADMIN_EMAILS.includes(email);
      
      // Find or auto-create user by email
      let user = null;
      try {
        user = await prisma.userAccount.findUnique({
          where: { email }
        });

        if (!user) {
          user = await prisma.userAccount.create({
            data: {
              email,
              name: email.split("@")[0],
              role: isAdmin ? "admin" : "user",
              status: "active",
            }
          });
        } else if (isAdmin && user.role !== "admin") {
          user = await prisma.userAccount.update({
            where: { email },
            data: { role: "admin", status: "active" }
          });
        }
      } catch (dbErr) {
        console.warn("DB lookup failed, using fallback auth:", dbErr);
        return {
          id: `email-${email}`,
          name: email.split("@")[0],
          email: email,
          role: isAdmin ? "admin" : "user"
        };
      }

      return { 
        id: user.id, 
        name: user.name || email.split("@")[0], 
        email: user.email, 
        role: user.role 
      };
    },
  }),
];

// Conditionally enable OAuth only when valid credentials are provided
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

if (process.env.AZURE_AD_CLIENT_ID && process.env.AZURE_AD_CLIENT_SECRET) {
  providers.push(
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
      tenantId: process.env.AZURE_AD_TENANT_ID || "common",
    })
  );
}

export const authOptions: NextAuthOptions = {
  providers,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        if (user.id === "viewer") {
          token.role = "viewer";
          token.username = "Viewer";
          token.status = "active";
        } else if (user.id === "guest") {
          token.role = "guest";
          token.username = "Guest User";
          token.status = "active";
        } else if (user.id === "local-admin") {
          token.role = "admin";
          token.username = "Mohammed Iqbal";
          token.status = "active";
        } else if (user.id.startsWith("staff-")) {
          token.role = (user as any).role || "admin";
          token.username = user.name || "Staff";
          token.status = "active";
        } else if (user.email) {
          const email = user.email.toLowerCase();
          const isAdmin = ADMIN_EMAILS.includes(email);
          
          try {
            let dbUser = await prisma.userAccount.findUnique({
              where: { email },
            });

            if (!dbUser) {
              const authCode = Math.random().toString(36).substring(2, 8).toUpperCase();
              dbUser = await prisma.userAccount.create({
                data: {
                  email,
                  name: user.name || email.split("@")[0],
                  role: isAdmin ? "admin" : "user",
                  status: "active",
                  authCode
                }
              });
            } else if (isAdmin && dbUser.role !== "admin") {
              dbUser = await prisma.userAccount.update({
                where: { email },
                data: { role: "admin", status: "active" }
              });
            }

            token.role = isAdmin ? "admin" : dbUser.role;
            token.status = "active";
            token.username = dbUser.name || user.name || "User";
            token.image = dbUser.image || user.image;
          } catch (e) {
            token.role = isAdmin ? "admin" : "user";
            token.status = "active";
            token.username = user.name || email.split("@")[0];
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role || "user";
        (session.user as any).status = token.status || "active";
        (session.user as any).username = token.username || "User";
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
    error: "/",
  },
  secret: process.env.NEXTAUTH_SECRET || "badwadachoon-secret-key-1234567890-super-secure",
};
