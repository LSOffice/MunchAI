import { type NextAuthOptions } from "next-auth";
import NextAuth from "next-auth";
import { getServerSession } from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectMongo } from "@/lib/mongodb";
import User from "@/models/User";
import { jwtVerify } from "jose";
import { getAuthSecret } from "@/lib/secrets";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
    updateAge: 24 * 60 * 60, // refresh token cookie daily
  },
  jwt: {
    maxAge: 7 * 24 * 60 * 60,
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      },
    },
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
        if (!loginToken) {
          console.log("[Auth] No login token provided");
          return null;
        }
        try {
          const secret = new TextEncoder().encode(getAuthSecret());
          const { payload } = await jwtVerify(loginToken, secret).catch(
            () => ({ payload: null }) as any,
          );
          const uid = (payload?.uid as string) || null;
          if (!uid) {
            console.log("[Auth] No uid in payload");
            return null;
          }
          await connectMongo();
          const user = (await User.findById(uid).lean()) as any;
          if (!user) {
            console.log("[Auth] User not found for uid:", uid);
            return null;
          }
          console.log("[Auth] Successfully authorized user:", user.email);
          return {
            id: String(user._id),
            email: user.email,
            name: user.name,
          } as any;
        } catch (err) {
          console.error("[Auth] Authorization error:", err);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        console.log("[Auth JWT] Adding user to token:", user.email);
        token.id = user.id;
      }
      // Validate that user still exists in database on each token refresh
      if (token?.id) {
        await connectMongo();
        const userExists = (await User.findById(token.id).lean()) as any;
        if (!userExists) {
          // User no longer exists, mark token as invalid
          console.log(
            "[Auth JWT] User no longer exists, marking token invalid",
          );
          token.invalid = true;
        }
      }
      return token;
    },
    async session({ session, token }: any) {
      // If token is marked invalid (user was deleted), clear session
      if (!token || token?.invalid) {
        console.log("[Auth Session] Token invalid, clearing session");
        session.user = {} as any;
        return session;
      }
      if (token?.id) {
        console.log("[Auth Session] Adding id to session");
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  secret: getAuthSecret(),
};

const handler = NextAuth(authOptions);

export const auth = () => getServerSession(authOptions);
export const signIn = handler.signin;
export const signOut = handler.signout;
export default handler;
