import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        (session.user as { role: string }).role = token.role as string;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const protectedRoutes = ["/agency", "/workspace"];
      const isProtected = protectedRoutes.some((route) =>
        nextUrl.pathname.startsWith(route)
      );

      if (isProtected && !isLoggedIn) {
        return false;
      }

      return true;
    },
  },
  pages: {
    signIn: "/login",
  },
  providers: [],
} satisfies NextAuthConfig;
