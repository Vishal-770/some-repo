export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date | string;
  role?: string;
  username?: string;
  points?: number;
  banned?: boolean | null;
  banReason?: string | null;
  banExpires?: Date | string | null;
  bannedAt?: Date | string | null;
  teamId?: string | null;
  teamName?: string | null;
  // Custom fields
}

export interface SearchFilters {
  searchValue: string;
  searchField: "email" | "name";
}
