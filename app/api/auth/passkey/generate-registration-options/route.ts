import { NextRequest } from "next/server";
import { generateRegistrationOptions } from "@simplewebauthn/server";
import { auth } from "@/lib/auth";
import { connectMongo } from "@/lib/mongodb";
import User from "@/models/User";
import { errorResponse, successResponse, APIError } from "@/lib/utils";

function rpFromRequest(req: NextRequest) {
  const host = req.headers.get("host") || "localhost:3000";
  const proto = (req.headers.get("x-forwarded-proto") || "http").split(",")[0];
  const rpID = host.split(":")[0];
  const origin = `${proto}://${host}`;
  return { rpID, origin };
}

export async function POST(req: NextRequest) {
  try {
    const session = (await auth()) as any;
    if (!session?.user?.id)
      throw new APIError(401, "Unauthorized", "UNAUTHORIZED");
    await connectMongo();
    const user = await User.findById(session.user.id);
    if (!user) throw new APIError(404, "User not found", "NOT_FOUND");

    const { rpID } = rpFromRequest(req);
    const opts = await generateRegistrationOptions({
      rpName: process.env.WEBAUTHN_RP_NAME || "MunchAI",
      rpID,
      userID: new Uint8Array(Buffer.from(String(user._id))),
      userName: user.email,
      userDisplayName: user.name || user.email,
      attestationType: "none",
      excludeCredentials: (user.passkeys || []).map((pk: any) => ({
        id: new Uint8Array(pk.credentialID),
        type: "public-key" as const,
        transports: pk.transports as any,
      })),
      authenticatorSelection: {
        residentKey: "preferred",
        userVerification: "preferred",
      },
    });
    user.currentChallenge = opts.challenge;
    await user.save();
    return successResponse(opts);
  } catch (error) {
    return errorResponse(error);
  }
}
