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
}

interface WorldCup26GamesResponse {
  games: WorldCup26Game[];
}

function parseDate(localDate: string): string {
  const [month, day, year] = localDate.split(" ")[0].split("/");
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

export async function fetchWorldCup26Matches(): Promise<OpenFootballMatch[]> {
  const response = await fetch("https://worldcup26.ir/get/games", {
    next: { revalidate: 3600 },
    signal: AbortSignal.timeout(5000),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch worldcup26 data: ${response.status}`);
  }

  const data = (await response.json()) as WorldCup26GamesResponse;

  return data.games
    .filter((game) => game.finished === "TRUE")
    .map((game) => ({
      round: `Matchday ${game.matchday}`,
      date: parseDate(game.local_date),
      team1: game.home_team_name_en,
      team2: game.away_team_name_en,
      group: `Group ${game.group}`,
      score: {
        ft: [Number(game.home_score), Number(game.away_score)],
      },
    }));
}
