import { NextRequest } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import User from "@/models/User";
import { errorResponse, successResponse, APIError } from "@/lib/utils";
import { generateAuthenticationOptions } from "@simplewebauthn/server";

function getOriginAndRpID(req: NextRequest) {
  const originHeader =
    req.headers.get("origin") ||
    process.env.NEXTAUTH_URL ||
    "http://localhost:3000";
  const originUrl = new URL(originHeader);
  const rpID = originUrl.hostname;
  return { rpID };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = String(body.email || "")
      .trim()
      .toLowerCase();
    if (!email) throw new APIError(400, "Email required", "INVALID_REQUEST");

    await connectMongo();
    const user = await User.findOne({ email });
    if (!user || !user.passkeys || user.passkeys.length === 0) {
      throw new APIError(404, "No passkeys registered", "NO_PASSKEYS");
    }

    const { rpID } = getOriginAndRpID(req);

    const options = generateAuthenticationOptions({
      timeout: 60000,
      allowCredentials: user.passkeys.map((pk) => ({
        id: pk.credentialID,
        type: "public-key",
        transports: pk.transports,
      })),
      userVerification: "preferred",
      rpID,
    });

    user.currentChallenge = options.challenge;
    await user.save();

    return successResponse(options);
  } catch (error) {
    return errorResponse(error);
  }
}
