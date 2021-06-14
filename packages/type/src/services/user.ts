export interface User {
  id: string;
  name: string;
  role: number;
  password?: string;
  provider?: string;
  avatarUrl?: string;
  lastLogin?: number;
  email?: string;
}

export interface UserRole {
  id: string;
  scope: string;
  role: number;
}