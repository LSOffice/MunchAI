import { NextRequest, NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import MagicToken from "@/models/MagicToken";
import User from "@/models/User";
import TempAccount from "@/models/TempAccount";
import { errorResponse } from "@/lib/utils";
import { SignJWT } from "jose";

export async function GET(req: NextRequest) {
  try {
    await connectMongo();
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token") || "";
    if (!token)
      return NextResponse.redirect(
        new URL("/login?error=invalid_token", req.url),
      );

    const record = await MagicToken.findOne({ token }).lean();
    if (!record)
      return NextResponse.redirect(
        new URL("/login?error=invalid_token", req.url),
      );
    if (record.usedAt)
      return NextResponse.redirect(new URL("/login?error=used_token", req.url));
    if (new Date(record.expiresAt).getTime() < Date.now()) {
      return NextResponse.redirect(
        new URL("/login?error=expired_token", req.url),
      );
    }

    let user = await User.findOne({ email: record.email });

    // If this is an email-verification token from registration, create the user
    if (record.purpose === "email-verification" && !user) {
      const tempAccount = await TempAccount.findOne({ email: record.email });
      if (!tempAccount) {
        return NextResponse.redirect(
          new URL("/login?error=registration_not_found", req.url),
        );
      }

      // Create the verified user with the name from temp account
      user = await User.create({
        name: tempAccount.name,
        email: record.email,
        emailVerified: new Date(),
        dietaryRestrictions: [],
        allergies: [],
        cuisinePreferences: [],
        passkeys: [],
      });

      // Delete temp account
      await TempAccount.deleteOne({ _id: tempAccount._id });
    }

    if (!user)
      return NextResponse.redirect(
        new URL("/login?error=invalid_user", req.url),
      );

    // Mark token used and user verified
    await MagicToken.updateOne({ token }, { $set: { usedAt: new Date() } });
    if (!user.emailVerified) {
      user.emailVerified = new Date();
      await user.save();
    }

    // Create a short-lived login token for NextAuth Credentials provider
    const secret = new TextEncoder().encode(
      process.env.NEXTAUTH_SECRET || "dev-secret",
    );
    const loginToken = await new SignJWT({ uid: String(user._id) })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("5m")
      .sign(secret);

    const redirectTo = new URL(
      `/login?loginToken=${encodeURIComponent(loginToken)}&verified=1`,
      req.url,
    );
    return NextResponse.redirect(redirectTo);
  } catch (error) {
    return errorResponse(error);
  }
}
