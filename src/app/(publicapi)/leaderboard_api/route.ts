import { NextResponse } from "next/server";
import clientPromise from "@/src/lib/mongo";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const users = await db
      .collection("user")
      .find({ role: { $ne: "admin" } })
      .sort({ points: -1 })
      .limit(100)
      .toArray();

    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      id: user._id.toString(),
      name: user.name,
      points: user.points || 0,
    }));

    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
