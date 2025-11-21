import { NextRequest, NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import { errorResponse } from "@/lib/utils";
import { auth } from "@/lib/auth";
import SavedRecipeModel from "@/models/SavedRecipe";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = (await auth()) as any;
    const userId = session?.user?.id as string | undefined;
    if (!userId) {
      return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
    }
    const { id } = await params;
    await connectMongo();
    const deleted = await SavedRecipeModel.findOneAndDelete({
      userId,
      $or: [{ _id: id }, { recipeId: id }],
    });

    if (!deleted) {
      return NextResponse.json(errorResponse("Saved recipe not found"), {
        status: 404,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Saved recipe removed",
    });
  } catch (error) {
    return NextResponse.json(
      errorResponse(error instanceof Error ? error.message : "Server error"),
      { status: 500 },
    );
  }
}
