import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getSession } from "@/src/lib/auth-server";
import clientPromise from "@/src/lib/mongo";

export async function POST() {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();
    const teamsCollection = db.collection("teams");
    const usersCollection = db.collection("user");
    const userId = new ObjectId(session.user.id);

    // Find user's team
    const team = await teamsCollection.findOne({
      members: userId,
    });

    if (!team) {
      return NextResponse.json(
        { error: "You are not in a team" },
        { status: 404 }
      );
    }

    // Check if user is the team lead
    if (team.teamleadId.toString() === session.user.id) {
      return NextResponse.json(
        {
          error:
            "Team lead cannot leave the team. Transfer leadership or delete the team first.",
        },
        { status: 400 }
      );
    }

    // Remove user from team
    await teamsCollection.updateOne(
      { _id: team._id },
      { $pull: { members: userId } as any, $set: { updatedAt: new Date() } }
    );

    // Update user's teamId field
    await usersCollection.updateOne(
      { _id: userId },
      { $set: { teamId: null } }
    );

    return NextResponse.json({
      message: "Successfully left team",
    });
  } catch (error) {
    console.error("Error leaving team:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
