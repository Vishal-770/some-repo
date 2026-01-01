import api from "./axios";

export const fetchLeaderBoard = async (): Promise<LeaderboardUser[]> => {
  try {
    const response = await api.get("/leaderboard_api");
    return response.data;
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    throw new Error("Failed to fetch leaderboard" + error);
  }
};
export interface LeaderboardUser {
  rank: number;
  id: string;
  name: string;
  points: number;
}