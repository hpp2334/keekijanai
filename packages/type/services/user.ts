export interface User {
  id: string;
  name: string;
  password?: string;
  provider?: string;
  avatarUrl?: string;
  lastLogin?: number;
}