export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date | string;
  role?: string;
  username?: string;
  points?: number;
}

export interface CreateUserForm {
  email: string;
  password: string;
  name: string;
  role: "user";
}

export interface UpdateUserForm {
  email: string;
  name: string;
  points: number;
}

export interface SearchFilters {
  searchValue: string;
  searchField: "email" | "name";
}
