import { NextRequest } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import User from "@/models/User";
import { errorResponse, successResponse, APIError } from "@/lib/utils";
import { verifyAuthenticationResponse } from "@simplewebauthn/server";
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
    const user = (await User.findOne({ email })) as any;
    if (!user || !user.currentChallenge)
      throw new APIError(400, "No pending challenge", "NO_CHALLENGE");
    if (!user.passkeys || user.passkeys.length === 0)
      throw new APIError(404, "No passkeys", "NO_PASSKEYS");

    const { origin, rpID } = getOriginAndRpID(req.headers.get("origin"));

    console.log("Verifying authentication with:", {
      expectedChallenge: user.currentChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      credentialId: credential.id,
    });

    // Find the matching passkey
    const matchingPasskey = user.passkeys
      .map((pk: any) => ({
        credentialID: pk.credentialID,
        credentialPublicKey: pk.publicKey,
        counter: pk.counter,
        transports: pk.transports,
      }))
      .find(
        (a: any) => a.credentialID.toString("base64url") === credential.rawId,
      );

    const verification = await verifyAuthenticationResponse({
      response: credential,
      expectedChallenge: user.currentChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      requireUserVerification: true,
      authenticator: matchingPasskey as any,
    } as any).catch((e: any) => {
      console.error("Authentication verification error:", e);
      return {
        verified: false,
        error: e,
        authenticationInfo: null,
      };
    });

    if (!verification.verified || !verification.authenticationInfo) {
      throw new APIError(400, "Authentication failed", "VERIFY_FAILED");
    }

    const { newCounter, credentialID } = verification.authenticationInfo;
    // Update counter
    const pk = user.passkeys.find((p: any) =>
      p.credentialID.equals(Buffer.from(credentialID)),
    );
    if (pk) pk.counter = newCounter;
    user.currentChallenge = null;
    await user.save();

    const secret = new TextEncoder().encode(
      process.env.NEXTAUTH_SECRET || "dev-secret",
    );
    const loginToken = await new SignJWT({ uid: String(user._id) })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("5m")
      .sign(secret);

    return successResponse({ authenticated: true, loginToken });
  } catch (error) {
    return errorResponse(error);
  }
}
