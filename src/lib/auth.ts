import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
    Credentials({
      id: "demo-login",
      name: "Gaffer Demo Access",
      credentials: {
        email: { label: "Email", type: "email" },
        name: { label: "Manager Name", type: "text" },
      },
      async authorize(credentials) {
        const email = (credentials?.email as string)?.trim() || "gaffer@arena.fc";
        const name = (credentials?.name as string)?.trim() || "Pep Gaffer";

        let user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              email,
              name,
              image: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
            },
          });
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (user?.email) {
        try {
          const email = user.email.toLowerCase().trim();
          const existing = await prisma.user.findUnique({ where: { email } });
          if (!existing) {
            await prisma.user.create({
              data: {
                id: user.id || undefined,
                email,
                name: user.name || "Gaffer",
                image: user.image || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`,
              },
            });
          } else {
            await prisma.user.update({
              where: { id: existing.id },
              data: {
                name: user.name || existing.name,
                image: user.image || existing.image,
              },
            });
          }
        } catch (e) {
          console.error("Error upserting user on signIn:", e);
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user?.email) {
        try {
          const email = user.email.toLowerCase().trim();
          const dbUser = await prisma.user.findUnique({ where: { email } });
          if (dbUser) {
            token.sub = dbUser.id;
          } else if (user.id) {
            token.sub = user.id;
          }
        } catch (e) {
          console.error("Error finding user in jwt callback:", e);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.sub && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
});
