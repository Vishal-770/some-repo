import api from "./axios";
export interface Team {
  id: string;
  name: string;
  joinCode?: string;
  members: TeamMember[];
  teamleadId: string;
  teamleadName: string;
  points: number;
  logoUrl?: string;
  isVerified: boolean;
  createdAt: string;
  isTeamLead: boolean;
}
export interface TeamMember {
  id: string;
  name: string;
  email: string;
}
export const fetchUserTeam = async (): Promise<Team | null> => {
  try {
    const response = await api.get("/api/teams/my-team");
    return response.data.team;
  } catch (error) {
    console.error("Error fetching user team:", error);
    return null;
  }
};
