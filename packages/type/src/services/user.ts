export interface User {
  id: string;
  name: string;
  role: number;
  password?: string;
  provider?: string;
  avatarUrl?: string;
  lastLogin?: number;
}