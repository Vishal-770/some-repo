import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { auth } from "@/src/lib/auth";
import clientPromise from "@/src/lib/mongo";
import { headers } from "next/headers";

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has admin permissions
    const { error, success } = await auth.api.userHasPermission({
      body: {
        userId: session.user.id,
        permissions: {
          user: ["create"],
        },
      },
      headers: await headers(),
    });

    if (error || !success) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { teamId, isVerified } = await request.json();

    if (!teamId) {
      return NextResponse.json(
        { error: "Team ID is required" },
        { status: 400 }
      );
    }

    // Update team verification status
    const client = await clientPromise;
    const db = client.db();
    const teamsCollection = db.collection("teams");
    const result = await teamsCollection.updateOne(
      { _id: new ObjectId(teamId) },
      { $set: { isVerified: isVerified } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Team ${isVerified ? "verified" : "unverified"} successfully`,
    });
  } catch (error) {
    console.error("Error updating team verification:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
