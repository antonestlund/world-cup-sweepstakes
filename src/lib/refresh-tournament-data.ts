import { revalidatePath, revalidateTag } from "next/cache";

import { fetchTournamentData } from "./football-api";

export async function refreshTournamentData(): Promise<void> {
  await fetchTournamentData();
  revalidateTag("tournament-data", { expire: 0 });
  revalidatePath("/");
}
