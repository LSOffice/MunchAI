import { type NextAuthOptions } from "next-auth";
import NextAuth from "next-auth";
import { getServerSession } from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectMongo } from "@/lib/mongodb";
import User from "@/models/User";
import { jwtVerify } from "jose";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
    updateAge: 24 * 60 * 60, // refresh token cookie daily
  },
  jwt: {
    maxAge: 7 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "PasskeyOrMagicLink",
      credentials: {
        loginToken: { label: "loginToken", type: "text" },
      },
      async authorize(credentials) {
        const loginToken = credentials?.loginToken as string | undefined;
        if (!loginToken) return null;
        const secret = new TextEncoder().encode(
          process.env.NEXTAUTH_SECRET || "dev-secret",
        );
        const { payload } = await jwtVerify(loginToken, secret).catch(
          () => ({ payload: null }) as any,
        );
        const uid = (payload?.uid as string) || null;
        if (!uid) return null;
        await connectMongo();
        const user = await User.findById(uid).lean();
        if (!user) return null;
        return {
          id: String(user._id),
          email: user.email,
          name: user.name,
        } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
      }
      // Validate that user still exists in database on each token refresh
      if (token?.id) {
        await connectMongo();
        const userExists = await User.findById(token.id).lean();
        if (!userExists) {
          // User no longer exists, mark token as invalid
          token.invalid = true;
        }
      }
      return token;
    },
    async session({ session, token }: any) {
      // If token is marked invalid (user was deleted), clear session
      if (!token || token?.invalid) {
        session.user = {} as any;
        return session;
      }
      if (token?.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export const auth = () => getServerSession(authOptions);
export const signIn = handler.signin;
export const signOut = handler.signout;
export default handler;
