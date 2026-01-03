import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { auth } from "@/src/lib/auth";
import clientPromise from "@/src/lib/mongo";
import { headers } from "next/headers";

export async function GET(request: Request) {
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

    const client = await clientPromise;
    const db = client.db();
    const usersCollection = db.collection("user");

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");
    const searchValue = searchParams.get("searchValue") || "";
    const searchField = searchParams.get("searchField") || "email";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortDirection = searchParams.get("sortDirection") || "desc";

    // Build filter query
    const filter: Record<string, unknown> = {};
    if (searchValue) {
      if (searchField === "email") {
        filter.email = { $regex: searchValue, $options: "i" };
      } else if (searchField === "name") {
        filter.name = { $regex: searchValue, $options: "i" };
      }
    }

    // Build sort query
    const sort: Record<string, 1 | -1> = {};
    sort[sortBy] = sortDirection === "asc" ? 1 : -1;

    // Fetch users with pagination
    const [users, total] = await Promise.all([
      usersCollection
        .find(filter)
        .sort(sort)
        .skip(offset)
        .limit(limit)
        .toArray(),
      usersCollection.countDocuments(filter),
    ]);

    // Fetch team information for users who have teamId or are members of teams
    const teamsCollection = db.collection("teams");
    const usersWithTeams = await Promise.all(
      users.map(async (user) => {
        let teamName = null;
        let actualTeamId = user.teamId;

        // First try to get team from user's teamId field
        if (user.teamId) {
          try {
            const team = await teamsCollection.findOne({
              _id: new ObjectId(user.teamId),
            });
            teamName = team?.name || null;
          } catch (error) {
            console.error("Error fetching team by teamId:", error);
          }
        }

        // If no team found via teamId, check if user is a member of any team
        if (!teamName) {
          try {
            const team = await teamsCollection.findOne({
              members: user._id,
            });
            if (team) {
              teamName = team.name;
              actualTeamId = team._id.toString();
              // Update user's teamId field for future queries
              await usersCollection.updateOne(
                { _id: user._id },
                { $set: { teamId: actualTeamId } }
              );
            }
          } catch (error) {
            console.error("Error fetching team by member:", error);
          }
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
          role: user.role || "user",
          username: user.username,
          points: user.points || 0,
          banned: user.banned || false,
          banReason: user.banReason || null,
          banExpires: user.banExpires || null,
          bannedAt: user.bannedAt || null,
          teamId: actualTeamId || null,
          teamName: teamName,
        };
      })
    );

    return NextResponse.json({
      users: usersWithTeams,
      total,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
