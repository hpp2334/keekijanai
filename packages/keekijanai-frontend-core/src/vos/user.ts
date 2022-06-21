export interface UserVO {
  /** @format int64 */
  id: number;
  name: string;

  /** @format int16 */
  role: number;
  provider: string;
  avatar_url?: string;
  email?: string;
}
