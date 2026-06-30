import type { OpenFootballMatch } from "./types";

interface WorldCup26Game {
  finished: string;
  matchday: string;
  local_date: string;
  home_team_name_en: string;
  away_team_name_en: string;
  home_score: string;
  away_score: string;
  group: string;
  type?: string;
}

interface WorldCup26GamesResponse {
  games: WorldCup26Game[];
}

const KNOCKOUT_ROUNDS: Record<string, string> = {
  r32: "Round of 32",
  r16: "Round of 16",
  qf: "Quarter-final",
  sf: "Semi-final",
  third: "Match for third place",
  final: "Final",
};

function parseDate(localDate: string): string {
  const [month, day, year] = localDate.split(" ")[0].split("/");
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

function mapWorldCup26Game(game: WorldCup26Game): OpenFootballMatch | null {
  const isKnockout = Boolean(game.type && game.type !== "group");
  const round = isKnockout
    ? KNOCKOUT_ROUNDS[game.type!]
    : `Matchday ${game.matchday}`;

  if (!round) return null;

  const match: OpenFootballMatch = {
    round,
    date: parseDate(game.local_date),
    team1: game.home_team_name_en,
    team2: game.away_team_name_en,
    score: {
      ft: [Number(game.home_score), Number(game.away_score)],
    },
  };

  if (!isKnockout && /^[A-L]$/.test(game.group)) {
    match.group = `Group ${game.group}`;
  }

  return match;
}

export async function fetchWorldCup26Matches(): Promise<OpenFootballMatch[]> {
  const response = await fetch("https://worldcup26.ir/get/games", {
    next: { revalidate: 3600, tags: ["tournament-data"] },
    signal: AbortSignal.timeout(5000),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch worldcup26 data: ${response.status}`);
  }

  const data = (await response.json()) as WorldCup26GamesResponse;

  return data.games
    .filter((game) => game.finished === "TRUE")
    .map(mapWorldCup26Game)
    .filter((match): match is OpenFootballMatch => match !== null);
}
