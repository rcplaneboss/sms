import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "database" },
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
          // User does not exist → must register first
          return "/register?error=NO_ACCOUNT";
        }

        const hasGoogleAccount = existingUser.accounts.some(
          (acc) => acc.provider === "google"
        );

        if (!hasGoogleAccount) {
          // Allow linking if the logged-in user is the same as the email owner
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

          // Otherwise, block the sign-in
          return "/login?error=OAUTH_NOT_LINKED";
        }
      }

      return true;
    },
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.role = user.role ?? "STUDENT";
      }
      return session;
    },
   async redirect({ url, baseUrl }) {
  if (url === baseUrl) {
    const session = await auth();
    const userRole = session?.user?.role;

    if (userRole === "STUDENT") {
      return `${baseUrl}/student-dashboard`;
    }
    if (userRole === "TEACHER") {
      return `${baseUrl}/teacher-dashboard`;
    }
    if (userRole === "ADMIN") {
      return `${baseUrl}/admin-dashboard`;
    }
  }

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
