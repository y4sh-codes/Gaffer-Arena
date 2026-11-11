"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Power, Loader2 } from "lucide-react";

interface EndLeagueButtonProps {
  leagueId: string;
}

export default function EndLeagueButton({ leagueId }: EndLeagueButtonProps) {
  const router = useRouter();
  const [ending, setEnding] = useState(false);

  const handleEndLeague = async () => {
    const confirmed = window.confirm(
      "End this league? It will be marked as completed and no further fixtures should be played."
    );
    if (!confirmed) return;

    setEnding(true);
    try {
      const res = await fetch(`/api/leagues/${leagueId}/auction`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "endLeague" }),
      });
      const data = await res.json();
      if (data.success) {
        router.push("/dashboard");
        router.refresh();
      } else {
        alert(data.error || "Failed to end league");
        setEnding(false);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to end league");
      setEnding(false);
    }
  };

  return (
    <button
      onClick={handleEndLeague}
      disabled={ending}
      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 text-xs font-bold uppercase tracking-wider border border-red-500/30 transition disabled:opacity-50"
    >
      {ending ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <Power className="w-3.5 h-3.5" />
      )}
      {ending ? "Ending League..." : "End League"}
    </button>
  );
}
