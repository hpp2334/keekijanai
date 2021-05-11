export type StarType = -1 | 0 | 1 | null;

export interface Get {
  total: number;

  // The star of current user posted
  current: StarType
}