import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { auth } from "@/src/lib/auth";
import clientPromise from "@/src/lib/mongo";
import { headers } from "next/headers";

export async function GET() {
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

    // Fetch all teams
    const client = await clientPromise;
    const db = client.db();
    const teamsCollection = db.collection("teams");
    const teams = await teamsCollection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    // Get team members and team lead details for each team
    const usersCollection = db.collection("user");
    const teamsWithDetails = await Promise.all(
      teams.map(async (team) => {
        const memberIds = team.members.map((id: ObjectId | string) => 
          id instanceof ObjectId ? id : new ObjectId(id)
        );
        const teamLeadId = new ObjectId(team.teamleadId);

        const [membersData, teamLeadData] = await Promise.all([
          usersCollection
            .find({ _id: { $in: memberIds } })
            .project({ name: 1, email: 1 })
            .toArray(),
          usersCollection.findOne(
            { _id: teamLeadId },
            { projection: { name: 1, email: 1 } }
          ),
        ]);

        return {
          id: team._id.toString(),
          name: team.name,
          teamleadId: team.teamleadId.toString(),
          teamleadName: teamLeadData?.name || "Unknown",
          members: membersData.map((member) => ({
            id: member._id.toString(),
            name: member.name,
            email: member.email,
          })),
          points: team.points || 0,
          isVerified: team.isVerified || false,
          joinCode: team.joinCode,
          createdAt: team.createdAt,
        };
      })
    );

    return NextResponse.json({ teams: teamsWithDetails });
  } catch (error) {
    console.error("Error fetching teams:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
