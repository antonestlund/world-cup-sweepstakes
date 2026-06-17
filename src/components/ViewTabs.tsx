"use client";

import { useState } from "react";

type Tab = "countries" | "friends";

const TABS: { id: Tab; label: string }[] = [
  { id: "countries", label: "Countries" },
  { id: "friends", label: "Friends" },
];

export function ViewTabs({
  countries,
  friends,
}: {
  countries: React.ReactNode;
  friends: React.ReactNode;
}) {
  const [activeTab, setActiveTab] = useState<Tab>("countries");

  return (
    <div>
      <div
        className="mb-4 flex justify-center"
        role="tablist"
        aria-label="Leaderboard view"
      >
        <div className="flex w-full rounded-full bg-white/10 p-1 sm:w-72">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.id)}
                className={
                  isActive
                    ? "flex-1 rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-emerald-950 shadow-sm transition-colors sm:px-8"
                    : "flex-1 rounded-full px-4 py-1.5 text-sm font-medium text-emerald-100/80 transition-colors hover:text-white sm:px-8"
                }
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div role="tabpanel">
        {activeTab === "countries" ? countries : friends}
      </div>
    </div>
  );
}
