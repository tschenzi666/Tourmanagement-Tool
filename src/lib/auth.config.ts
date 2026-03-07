import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"

// This config is used by both the middleware (Edge Runtime) and the full auth.
// It must NOT import Prisma or bcrypt (Node.js-only modules).
// The actual credential verification happens in auth.ts via the authorize callback override.

export default {
  trustHost: true,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
} satisfies NextAuthConfig
