import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getSession } from "@/src/lib/auth-server";
import clientPromise from "@/src/lib/mongo";
import mongoose from "mongoose";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get MongoDB collections
    const client = await clientPromise;
    const db = client.db();
    const teamsCollection = db.collection("teams");
    const usersCollection = db.collection("user");

    const userId = new ObjectId(session.user.id);

    // Find user's team
    const team = await teamsCollection.findOne({
      $or: [{ members: userId }, { teamleadId: userId }],
    });

    if (!team) {
      return NextResponse.json({ team: null });
    }

    // Get user details
    const memberIds = team.members.map((id: mongoose.Types.ObjectId) => new ObjectId(id));
    const teamLeadId = new ObjectId(team.teamleadId);

    const [membersData, teamLeadData] = await Promise.all([
      usersCollection.find({ _id: { $in: memberIds } }).toArray(),
      usersCollection.findOne({ _id: teamLeadId }),
    ]);

    const membersMap = new Map(
      membersData.map((user) => [user._id.toString(), user])
    );

    const isTeamLead = team.teamleadId.toString() === session.user.id;

    return NextResponse.json({
      team: {
        id: team._id.toString(),
        name: team.name,
        joinCode: isTeamLead ? team.joinCode : undefined,
        members: team.members.map((memberId: mongoose.Types.ObjectId) => {
          const user = membersMap.get(memberId.toString());
          return {
            id: memberId.toString(),
            name: user?.name || "Unknown",
            email: user?.email || "Unknown",
          };
        }),
        teamleadId: team.teamleadId.toString(),
        teamleadName: teamLeadData?.name || "Unknown",
        points: team.points || 0,
        logoUrl: team.logoUrl,
        isVerified: team.isVerified || false,
        createdAt: team.createdAt,
        isTeamLead,
      },
    });
  } catch (error) {
    console.error("Error fetching team:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
