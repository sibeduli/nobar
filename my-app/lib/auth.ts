import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      // Update or create user with lastLoginAt
      if (user.email) {
        await prisma.user.upsert({
          where: { email: user.email },
          update: { lastLoginAt: new Date() },
          create: {
            email: user.email,
            name: user.name || null,
            image: user.image || null,
            lastLoginAt: new Date(),
          },
        });

        // Log login activity
        await logActivity({
          userEmail: user.email,
          action: 'LOGIN',
          description: `Masuk ke akun dengan Google`,
        });
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
});
