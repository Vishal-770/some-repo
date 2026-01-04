import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import mongoose from "mongoose";
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
      teamleadId: userId,
    });

    if (!team) {
      return NextResponse.json(
        { error: "You are not a team leader" },
        { status: 404 }
      );
    }

    // Check if team is verified
    if (team.isVerified) {
      return NextResponse.json(
        {
          error:
            "Cannot delete a verified team. Please contact an administrator.",
        },
        { status: 403 }
      );
    }

    // Get all team members
    const memberIds = team.members.map(
      (id: mongoose.Types.ObjectId) => new ObjectId(id)
    );
    const teamLeadId = new ObjectId(team.teamleadId);

    // Update all team members' teamId to null
    await usersCollection.updateMany(
      { _id: { $in: [...memberIds, teamLeadId] } },
      { $set: { teamId: null } }
    );

    // Delete the team
    await teamsCollection.deleteOne({ _id: team._id });

    return NextResponse.json({
      message: "Team deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting team:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
