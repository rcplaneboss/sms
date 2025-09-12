import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/prisma";
import bcrypt from "bcryptjs";

declare module "next-auth" {
  interface Session {
    user: {
      role?: "ADMIN" | "TEACHER" | "STUDENT";
    } & Session["user"];
  }
}

// declare module "next-auth/adapters" {
//   interface AdapterUser {
//     role: "ADMIN" | "TEACHER" | "STUDENT";
//   }
// }

// ...existing code...
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" }, // <-- Changed from "database" to "jwt"
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      profile: async (profile) => {
        const user = await prisma.user.findUnique({
          where: { email: profile.email },
        });
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: user?.role ?? "STUDENT",
        };
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        console.log("Prisma User object from authorize:", user);

        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );
        if (!isValid) return null;

        return user;
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
          include: { accounts: true },
        });

        if (!existingUser) {
          return "/register?error=NO_ACCOUNT";
        }

        const hasGoogleAccount = existingUser.accounts.some(
          (acc) => acc.provider === "google"
        );

        if (!hasGoogleAccount) {
          if (user.id === existingUser.id) {
            await prisma.account.create({
              data: {
                userId: existingUser.id,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                type: account.type,
                access_token: account.access_token,
                refresh_token: account.refresh_token,
                expires_at: account.expires_at,
              },
            });
            return true;
          }
          return "/login?error=OAUTH_NOT_LINKED";
        }
      }
      return true;
    },

    async session({ session, token, user }) {
      // For JWT strategy, use token to populate session
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string ?? "STUDENT";
      }
      return session;
    },

    async jwt({ token, user }) {
      // Persist user id and role in the token
      if (user) {
        token.id = user.id;
        token.role = user.role ?? "STUDENT";
      }
      return token;
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
});