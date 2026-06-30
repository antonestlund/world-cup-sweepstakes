"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { refreshDataAction } from "@/app/actions/refresh-data";

export function UpdateDataButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  function handleClick() {
    setMessage(null);

    startTransition(async () => {
      const result = await refreshDataAction();

      if (result.ok) {
        router.refresh();
        setMessage({ type: "success", text: "Data updated" });
        return;
      }

      setMessage({ type: "error", text: result.error });
    });
  }

  return (
    <div className="mt-8 flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className="rounded-full border border-emerald-400/30 bg-white/10 px-5 py-2 text-sm font-medium text-emerald-100 transition-colors hover:bg-white/15 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Updating…" : "Update data"}
      </button>
      {message && (
        <p
          className={`text-xs ${
            message.type === "success"
              ? "text-emerald-300/80"
              : "text-red-300/90"
          }`}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}
