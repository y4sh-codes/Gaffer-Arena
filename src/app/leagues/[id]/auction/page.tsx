"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PlayerAuctionCard from "@/components/auction/PlayerAuctionCard";
import AuctionClock from "@/components/auction/AuctionClock";
import BiddingConsole from "@/components/auction/BiddingConsole";
import AuctionSquadOverview from "@/components/auction/AuctionSquadOverview";
import { ArrowLeft, Loader2, Sparkles, CheckCircle2, Trophy, Play, Flag, Power, ShieldAlert } from "lucide-react";

interface AuctionPageProps {
  params: Promise<{ id: string }>;
}

export default function AuctionPage({ params }: AuctionPageProps) {
  const { id: leagueId } = use(params);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [biddingInProgress, setBiddingInProgress] = useState(false);
  const [auctionData, setAuctionData] = useState<any>(null);
  const [teams, setTeams] = useState<any[]>([]);
  const [isCreator, setIsCreator] = useState(false);
  const [leagueStatus, setLeagueStatus] = useState<string>("");
  const [endingAuction, setEndingAuction] = useState(false);
  const [endingLeague, setEndingLeague] = useState(false);

  // Find user's active team in this league (default to Pep Gaffer / first team if guest)
  const myTeam = teams.find((t) => t.managerName === "Pep Gaffer") || teams[0] || null;

  const fetchAuction = async () => {
    try {
      const res = await fetch(`/api/leagues/${leagueId}/auction`);
      const data = await res.json();
      if (data.success) {
        setAuctionData(data.auction);
        setTeams(data.teams);
        setIsCreator(Boolean(data.isCreator));
        setLeagueStatus(data.leagueStatus || "");
      }
    } catch (e) {
      console.error("Auction fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuction();

    // 1-second dynamic heartbeat ticker
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/leagues/${leagueId}/auction`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "tick" }),
        });
        const data = await res.json();
        if (data.success && data.auction) {
          setAuctionData(data.auction);
        }
      } catch (err) {
        console.error("Tick error:", err);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [leagueId]);

  const handleBid = async (increment: number) => {
    if (!myTeam) return;
    setBiddingInProgress(true);
    try {
      const res = await fetch(`/api/leagues/${leagueId}/auction`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "bid",
          teamId: myTeam.id,
          increment,
        }),
      });
      const data = await res.json();
      if (data.success && data.state) {
        setAuctionData(data.state);
        await fetchAuction(); // update team balances
      } else if (data.error) {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setBiddingInProgress(false);
    }
  };

  const handleSkip = async () => {
    if (!myTeam) return;
    setBiddingInProgress(true);
    try {
      const res = await fetch(`/api/leagues/${leagueId}/auction`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "skip",
          teamId: myTeam.id,
        }),
      });
      const data = await res.json();
      if (data.success && data.state) {
        setAuctionData(data.state);
        await fetchAuction();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setBiddingInProgress(false);
    }
  };

  const handleEndAuction = async () => {
    const confirmed = window.confirm(
      "End the auction now? The league will move to the season phase and remaining players will not be auctioned."
    );
    if (!confirmed) return;

    setEndingAuction(true);
    try {
      const res = await fetch(`/api/leagues/${leagueId}/auction`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "endAuction" }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.state) setAuctionData(data.state);
        await fetchAuction();
      } else {
        alert(data.error || "Failed to end auction");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to end auction");
    } finally {
      setEndingAuction(false);
    }
  };

  const handleEndLeague = async () => {
    const confirmed = window.confirm(
      "End this league? It will be marked as completed and no further fixtures should be played."
    );
    if (!confirmed) return;

    setEndingLeague(true);
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
        setEndingLeague(false);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to end league");
      setEndingLeague(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-arena-neonGreen animate-spin" />
        <p className="text-sm font-mono uppercase text-slate-400">Connecting to Real-Time Auction Engine...</p>
      </div>
    );
  }

  const currentPlayer = auctionData?.currentPlayer;
  const isDraftCompleted = auctionData?.status === "COMPLETED" || !currentPlayer;
  const auctionActive = auctionData?.status === "ACTIVE";
  const hasSkipped = myTeam && auctionData?.skippedTeamIds?.includes(myTeam.id);

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
      {/* Top Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-red-400">
                Live Interactive Auction
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight">
              Player {auctionData?.currentIndex + 1} of {auctionData?.totalPlayersInBag || 400}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/leagues/${leagueId}/team`}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold uppercase tracking-wider border border-white/10 transition"
          >
            <Play className="w-3.5 h-3.5 text-arena-neonGreen" />
            Tactics Board
          </Link>
          <Link
            href={`/leagues/${leagueId}/matches`}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-cyan-400 text-xs font-bold uppercase tracking-wider border border-white/10 transition"
          >
            Fixtures
          </Link>
        </div>
      </div>

      {isCreator && (
        <div className="glass-panel rounded-2xl p-4 border border-amber-500/30 bg-amber-950/10 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-amber-300 font-bold uppercase text-xs tracking-wider">
              <ShieldAlert className="w-4 h-4" />
              Commissioner Controls
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Only the league creator can end the auction or the league.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {auctionActive && (
              <button
                onClick={handleEndAuction}
                disabled={endingAuction || endingLeague}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-xs font-bold uppercase tracking-wider border border-amber-500/40 transition disabled:opacity-50"
              >
                {endingAuction ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Flag className="w-3.5 h-3.5" />
                )}
                {endingAuction ? "Ending Auction..." : "End Auction"}
              </button>
            )}

            {leagueStatus !== "COMPLETED" && (
              <button
                onClick={handleEndLeague}
                disabled={endingAuction || endingLeague}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 text-xs font-bold uppercase tracking-wider border border-red-500/30 transition disabled:opacity-50"
              >
                {endingLeague ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Power className="w-3.5 h-3.5" />
                )}
                {endingLeague ? "Ending League..." : "End League"}
              </button>
            )}
          </div>
        </div>
      )}

      {isDraftCompleted ? (
        <div className="glass-panel rounded-3xl p-12 text-center border border-white/10 max-w-2xl mx-auto my-12">
          <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-arena-neonGreen flex items-center justify-center mx-auto mb-6 shadow-neon">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-black uppercase tracking-tight text-white mb-2">
            Auction Draft Complete!
          </h2>
          <p className="text-slate-400 text-sm max-w-md mx-auto mb-8">
            The auction draft has concluded. Proceed to the Tactics Hub to set your starting XI, player roles, and mentality before fixture kickoff.
          </p>
          <Link
            href={`/leagues/${leagueId}/team`}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-arena-neonGreen text-slate-950 font-black text-sm uppercase tracking-wider shadow-neon hover:scale-105 transition"
          >
            <Trophy className="w-4 h-4" />
            Configure Tactics & Pitch Lineup
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Stage: Player Card & Bidding Console */}
          <div className="lg:col-span-8 space-y-6">
            <PlayerAuctionCard player={currentPlayer} />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="sm:col-span-1">
                <AuctionClock
                  timeLeftSeconds={auctionData.timeLeftSeconds}
                  currentBid={auctionData.currentBid}
                  highestBidderTeamName={auctionData.highestBidderTeamName}
                  status={auctionData.status}
                />
              </div>

              <div className="sm:col-span-2">
                <BiddingConsole
                  myTeam={myTeam}
                  currentBid={auctionData.currentBid}
                  highestBidderTeamId={auctionData.highestBidderTeamId}
                  onBid={handleBid}
                  onSkip={handleSkip}
                  hasSkipped={hasSkipped}
                  biddingInProgress={biddingInProgress}
                />
              </div>
            </div>
          </div>

          {/* Right Sidebar: Draft Board & Bid Logs */}
          <div className="lg:col-span-4">
            <AuctionSquadOverview
              teams={teams}
              bidHistory={auctionData.bidHistory || []}
              myTeamId={myTeam?.id}
            />
          </div>
        </div>
      )}
    </div>
  );
}
