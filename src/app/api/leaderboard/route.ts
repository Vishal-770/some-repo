import { NextResponse } from "next/server";
import clientPromise from "@/src/lib/mongo";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const teamsCollection = db.collection("teams");

    // Fetch all verified teams sorted by points
    const teams = await teamsCollection
      .find({ isVerified: true })
      .sort({ points: -1 })
      .toArray();

    // Add rank to each team
    const rankedTeams = teams.map((team, index) => ({
      rank: index + 1,
      id: team._id.toString(),
      name: team.name,
      points: team.points || 0,
    }));

    return NextResponse.json(rankedTeams);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    // Return empty array instead of error object to maintain consistent API response
    return NextResponse.json([]);
  }
}
