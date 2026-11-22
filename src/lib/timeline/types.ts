export const SLOT = 15; // minutes; all times snap to this
export const DAY = 24 * 60;

/** All instants are whole minutes since the Unix epoch, in UTC. */
export type Repeat =
  | { kind: "none" }
  | { kind: "daily"; until?: number }
  /** `days` is a bitmask of UTC weekdays: bit 0 = Sunday ... bit 6 = Saturday. */
  | { kind: "weekly"; days: number; until?: number };

export type Team = { name: string; color: number };

export type Window = {
  team: number; // index into Timeline.teams
  label: string;
  start: number;
  duration: number; // minutes
  repeat: Repeat;
};

export type Timeline = { teams: Team[]; windows: Window[] };

export type Occurrence = {
  team: number;
  window: number; // index into Timeline.windows
  start: number;
  end: number;
};

export const MAX_TEAMS = 20;
export const MAX_WINDOWS = 200;
export const MAX_TEAM_NAME = 24;
export const MAX_LABEL = 40;
export const LINK_WARN = 1000;

export const TEAM_COLORS = [
  "#FFD600", "#60A5FA", "#34D399", "#F87171", "#C084FC",
  "#FB923C", "#2DD4BF", "#F472B6", "#A3E635", "#94A3B8",
];
