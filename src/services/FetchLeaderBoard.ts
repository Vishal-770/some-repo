import api from "./axios";

export interface TeamLeaderboardItem {
  rank: number;
  id: string;
  name: string;
  points: number;
}

export const fetchTeamsLeaderBoard = async (): Promise<
  TeamLeaderboardItem[]
> => {
  try {
    const response = await api.get("/api/leaderboard");
    return response.data;
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    throw error;
  }
};
