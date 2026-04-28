import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { authenticateWithCredentials } from "@/services/auth.service";

export const authOptions: NextAuthOptions = {
  logger: {
    error(code, metadata) {
      if (code === "JWT_SESSION_ERROR") {
        return;
      }

      console.error("[next-auth][error]", code, metadata ?? {});
    },
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await authenticateWithCredentials({
          email: credentials.email,
          password: credentials.password,
        });

        if (!user) {
          return null;
        }

        return user;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.role = user.role;
        token.name = user.name;
        token.email = user.email;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub && token.role) {
        session.user.id = token.sub;
        session.user.role = token.role as "admin" | "mentor" | "mentee";
      }

      return session;
    },
  },
};
