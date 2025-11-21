import { type NextAuthOptions } from "next-auth";
import NextAuth from "next-auth";
import { getServerSession } from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectMongo } from "@/lib/mongodb";
import User from "@/models/User";
import MagicToken from "@/models/MagicToken";
import { jwtVerify } from "jose";
import { getAuthSecret } from "@/lib/secrets";
import { cookies } from "next/headers";

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
        // Try to get loginToken from credentials first, then fallback to cookie
        let loginToken = credentials?.loginToken as string | undefined;
        if (!loginToken) {
          const cookieStore = await cookies();
          loginToken = cookieStore.get("loginToken")?.value;
        }
        if (!loginToken) {
          console.log("[Auth] No login token provided");
          return null;
        }

        await connectMongo();

        // 1. Try as JWT (legacy/cookie flow or passkey flow if used)
        try {
          const secret = new TextEncoder().encode(getAuthSecret());
          const { payload } = await jwtVerify(loginToken, secret);
          const uid = (payload?.uid as string) || null;
          if (uid) {
            const user = (await User.findById(uid).lean()) as any;
            if (user) {
              console.log(
                "[Auth] Successfully authorized user via JWT:",
                user.email,
              );
              return {
                id: String(user._id),
                email: user.email,
                name: user.name,
              } as any;
            }
          }
        } catch (err) {
          // Not a valid JWT, proceed to check as MagicToken
        }

        // 2. Try as MagicToken (polling flow)
        try {
          const magicToken = await MagicToken.findOne({ token: loginToken });
          if (magicToken) {
            // Check if expired
            if (new Date() > magicToken.expiresAt) {
              console.log("[Auth] Magic token expired");
              return null;
            }
            // Check if used (it MUST be used for the polling flow to work)
            // We allow login within 5 minutes of verification
            if (!magicToken.usedAt) {
              console.log("[Auth] Magic token not verified yet");
              return null;
            }
            const timeSinceUsed =
              new Date().getTime() - new Date(magicToken.usedAt).getTime();
            if (timeSinceUsed > 5 * 60 * 1000) {
              console.log(
                "[Auth] Magic token verification expired (used > 5m ago)",
              );
              return null;
            }

            const user = await User.findOne({ email: magicToken.email });
            if (user) {
              console.log(
                "[Auth] Successfully authorized user via MagicToken:",
                user.email,
              );
              // Optional: Delete token or mark as fully consumed to prevent reuse?
              // For now, the 5m window is fine.
              return {
                id: String(user._id),
                email: user.email,
                name: user.name,
              } as any;
            }
          }
        } catch (err) {
          console.error("[Auth] MagicToken check error:", err);
        }

        console.log("[Auth] Authorization failed");
        return null;
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
