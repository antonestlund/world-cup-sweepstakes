import assignmentsData from "@/data/assignments.json";
import teamsData from "@/data/teams.json";
import type { Participant, TeamConfig, TeamOwner } from "./types";

export const teams = teamsData as Record<string, TeamConfig>;
export const participants = assignmentsData.participants as Participant[];

const MOBILE_SHORT_NAMES: Record<string, string> = {
  "United States": "USA",
  "Bosnia and Herzegovina": "Bosnia",
  "Czech Republic": "Czechia",
  "Saudi Arabia": "Saudi",
  "South Africa": "S. Africa",
  "South Korea": "Korea",
  "New Zealand": "NZ",
  "Ivory Coast": "Ivory C.",
  "DR Congo": "Congo",
  Netherlands: "NED",
  Switzerland: "SUI",
  Uzbekistan: "Uzbek",
  "Cape Verde": "C. Verde",
  Australia: "Aus",
};

export function getTeamShortName(team: string): string {
  return MOBILE_SHORT_NAMES[team] ?? team;
}

export function getApiName(team: string): string {
  return teams[team]?.apiName ?? team;
}

export function getIsoCode(team: string): string {
  return teams[team]?.iso ?? "un";
}

export function getFifaRank(team: string): number {
  return teams[team]?.fifaRank ?? 999;
}

const EXTERNAL_ALIASES: Record<string, string> = {
  USA: "United States",
  "Bosnia & Herzegovina": "Bosnia and Herzegovina",
  "Democratic Republic of the Congo": "DR Congo",
};

export function apiNameToCanonical(apiName: string): string | null {
  if (teams[apiName]) return apiName;

  const alias = EXTERNAL_ALIASES[apiName];
  if (alias) return alias;

  for (const [canonical, config] of Object.entries(teams)) {
    if (config.apiName === apiName) return canonical;
  }

  return null;
}

export function buildOwnersMap(): Map<string, TeamOwner[]> {
  const map = new Map<string, TeamOwner[]>();

  for (const participant of participants) {
    const owner: TeamOwner = {
      name: participant.name,
      avatar: participant.avatar,
    };

    for (const team of participant.teams) {
      const owners = map.get(team) ?? [];
      owners.push(owner);
      map.set(team, owners);
    }
  }

  return map;
}

export function getAllAssignedTeams(): string[] {
  return Object.keys(teams);
}

export const ownersMap = buildOwnersMap();
