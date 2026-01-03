import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getSession } from "@/src/lib/auth-server";
import clientPromise from "@/src/lib/mongo";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { joinCode } = await request.json();

    if (
      !joinCode ||
      typeof joinCode !== "string" ||
      joinCode.trim().length === 0
    ) {
      return NextResponse.json(
        { error: "Join code is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();
    const teamsCollection = db.collection("teams");
    const usersCollection = db.collection("user");
    const userId = new ObjectId(session.user.id);

    // Check if user is already in a team
    const existingTeam = await teamsCollection.findOne({
      $or: [{ members: userId }, { teamleadId: userId }],
    });

    if (existingTeam) {
      return NextResponse.json(
        { error: "You are already in a team" },
        { status: 400 }
      );
    }

    // Find team by join code
    const team = await teamsCollection.findOne({
      joinCode: joinCode.trim().toUpperCase(),
    });

    if (!team) {
      return NextResponse.json({ error: "Invalid join code" }, { status: 404 });
    }

    // Check if team is verified
    if (team.isVerified) {
      return NextResponse.json(
        {
          error:
            "Cannot join a verified team. Please contact an administrator.",
        },
        { status: 403 }
      );
    }

    // Add user to team
    await teamsCollection.updateOne(
      { _id: team._id },
      { $push: { members: userId } as any, $set: { updatedAt: new Date() } }
    );

    // Update user's teamId field
    await usersCollection.updateOne(
      { _id: userId },
      { $set: { teamId: team._id.toString() } }
    );

    return NextResponse.json({
      message: "Successfully joined team",
      team: {
        id: team._id.toString(),
        name: team.name,
      },
    });
  } catch (error) {
    console.error("Error joining team:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
