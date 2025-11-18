import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { errorResponse } from "@/lib/utils";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const deleted = db.mealPlans.delete(id);

    if (!deleted) {
      return NextResponse.json(errorResponse("Meal plan entry not found"), {
        status: 404,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Meal plan entry removed",
    });
  } catch (error) {
    return NextResponse.json(
      errorResponse(error instanceof Error ? error.message : "Server error"),
      { status: 500 },
    );
  }
}
