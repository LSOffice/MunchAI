import { NextRequest } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import User from "@/models/User";
import { errorResponse, successResponse, APIError } from "@/lib/utils";
import { verifyRegistrationResponse } from "@simplewebauthn/server";
import { SignJWT } from "jose";

function getOriginAndRpID(originHeader: string | null) {
  const originBase =
    originHeader || process.env.NEXTAUTH_URL || "http://localhost:3000";
  const originUrl = new URL(originBase);
  const rpID = originUrl.hostname;
  return { origin: `${originUrl.protocol}//${originUrl.host}`, rpID };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = String(body.email || "")
      .trim()
      .toLowerCase();
    const credential = body.credential;
    if (!email || !credential)
      throw new APIError(
        400,
        "Email and credential required",
        "INVALID_REQUEST",
      );

    await connectMongo();
    const user = await User.findOne({ email });
    if (!user || !user.currentChallenge)
      throw new APIError(400, "No pending challenge", "NO_CHALLENGE");

    const { origin, rpID } = getOriginAndRpID(req.headers.get("origin"));

    const verification = await verifyRegistrationResponse({
      response: credential,
      expectedChallenge: user.currentChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      requireUserVerification: true,
    }).catch((e) => ({ verified: false, error: e }));

    if (!verification.verified || !verification.registrationInfo) {
      throw new APIError(
        400,
        "Registration verification failed",
        "VERIFY_FAILED",
      );
    }

    const { credentialPublicKey, credentialID, counter } =
      verification.registrationInfo;

    user.passkeys = user.passkeys || [];
    const exists = user.passkeys.find((pk) =>
      pk.credentialID.equals(Buffer.from(credentialID)),
    );
    if (!exists) {
      user.passkeys.push({
        credentialID: Buffer.from(credentialID),
        publicKey: Buffer.from(credentialPublicKey),
        counter,
        transports: credential.transports || [],
      } as any);
    }
    user.currentChallenge = null;
    if (!user.emailVerified) user.emailVerified = new Date();
    await user.save();

    const secret = new TextEncoder().encode(
      process.env.NEXTAUTH_SECRET || "dev-secret",
    );
    const loginToken = await new SignJWT({ uid: String(user._id) })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("5m")
      .sign(secret);

    return successResponse({ registered: true, loginToken });
  } catch (error) {
    return errorResponse(error);
  }
}
