export type TournamentRound =
  | "group"
  | "round-of-32"
  | "round-of-16"
  | "quarter-final"
  | "semi-final"
  | "third-place"
  | "final"
  | "winner"
  | "runner-up";

export interface TeamConfig {
  apiName: string;
  iso: string;
  fifaRank: number;
}

export interface Participant {
  name: string;
  avatar: string;
  teams: string[];
}

export interface TeamOwner {
  name: string;
  avatar: string;
}

export interface GroupStats {
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  groupPosition: number | null;
  group: string | null;
}

export interface LeaderboardEntry {
  team: string;
  owners: TeamOwner[];
  iso: string;
  fifaRank: number;
  statusShort: string;
  statusLong: string;
  isEliminated: boolean;
  round: TournamentRound;
  roundSort: number;
  groupStats: GroupStats;
  isWinner: boolean;
  isRunnerUp: boolean;
}

export interface OpenFootballMatch {
  round: string;
  date?: string;
  team1: string;
  team2: string;
  group?: string;
  score?: {
    ft: [number, number];
    ht?: [number, number];
  };
}

export interface OpenFootballData {
  name: string;
  matches: OpenFootballMatch[];
}

export interface LeaderboardData {
  entries: LeaderboardEntry[];
  lastUpdated: string;
  tournamentName: string;
  finishedMatches: number;
}

export interface FriendTeamEntry {
  team: string;
  iso: string;
  isEliminated: boolean;
  isWinner: boolean;
  isRunnerUp: boolean;
  roundSort: number;
  fifaRank: number;
  statusShort: string;
  statusLong: string;
  groupStats: GroupStats;
}

export interface FriendLeaderboardEntry {
  name: string;
  avatar: string;
  teams: FriendTeamEntry[];
  hasWinner: boolean;
  hasRunnerUp: boolean;
  activeCount: number;
  bestRoundSort: number;
  totalPoints: number;
  totalWins: number;
  totalGoalDifference: number;
  bestFifaRank: number;
}
