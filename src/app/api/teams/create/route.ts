import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getSession } from "@/src/lib/auth-server";
import clientPromise from "@/src/lib/mongo";
import { randomBytes } from "crypto";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name } = await request.json();

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Team name is required" },
        { status: 400 }
      );
    }

    if (name.trim().length < 3 || name.trim().length > 50) {
      return NextResponse.json(
        { error: "Team name must be between 3 and 50 characters" },
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

    // Check if team name already exists
    const existingTeamName = await teamsCollection.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
    });

    if (existingTeamName) {
      return NextResponse.json(
        { error: "Team name already exists" },
        { status: 400 }
      );
    }

    // Generate unique join code
    const joinCode = randomBytes(4).toString("hex").toUpperCase();

    const newTeam = {
      name: name.trim(),
      teamleadId: userId,
      members: [userId],
      joinCode,
      points: 0,
      isVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await teamsCollection.insertOne(newTeam);

    // Update user's teamId field
    await usersCollection.updateOne(
      { _id: userId },
      { $set: { teamId: result.insertedId.toString() } }
    );

    return NextResponse.json({
      message: "Team created successfully",
      team: {
        id: result.insertedId.toString(),
        name: newTeam.name,
        joinCode: newTeam.joinCode,
      },
    });
  } catch (error) {
    console.error("Error creating team:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
