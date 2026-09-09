import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import type { DailyStats } from "@/utils/stats";
import { MAX_GUESSES } from "@/utils/stats";
import { cn } from "@/lib/utils";

export const StatsDialog: React.FC<{
  stats: DailyStats;
  open: boolean;
  onClose: () => void;
  onShare?: () => void;
}> = ({ stats, open, onClose, onShare }) => {
  const total = Math.max(stats.wins, 1);
  const winPct = stats.plays === 0 ? 0 : Math.round((stats.wins / stats.plays) * 100);
  const highest = Math.max(1, ...stats.distribution.slice(1));

  const metric = (label: string, value: number | string) => (
    <div className="flex flex-col items-center px-2">
      <span className="text-3xl font-black text-lime-300 leading-none drop-shadow-[0_0_8px_rgba(163,230,53,0.4)]">
        {value}
      </span>
      <span className="mt-1 text-[0.62rem] uppercase tracking-wider font-bold text-green-200/70 text-center">
        {label}
      </span>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md rounded-xl border-green-700 bg-[#0c1812] text-green-50">
        <DialogHeader>
          <DialogTitle className="text-lime-300 text-xl font-black tracking-wide">Statistics</DialogTitle>
          <DialogDescription className="text-green-100">
            Your daily progress. Streaks cover consecutive daily wins only.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-4 gap-2 py-1">
          {metric("Played", stats.plays)}
          {metric("Win %", `${winPct}%`)}
          {metric("Streak", stats.currentStreak)}
          {metric("Max", stats.maxStreak)}
        </div>

        <div className="mt-2">
          <p className="text-green-100 font-bold tracking-wide text-sm mb-2 text-center">
            Guess distribution
          </p>
          <div className="flex flex-col gap-1.5">
            {Array.from({ length: MAX_GUESSES }).map((_, i) => {
              const n = i + 1;
              const count = stats.distribution[n] ?? 0;
              const width = count === 0 ? 0 : Math.max(8, Math.round((count / highest) * 100));
              return (
                <div key={n} className="flex items-center gap-2">
                  <span className="w-4 text-right font-bold text-green-200/80 text-sm">{n}</span>
                  <div className="flex-1 h-6 rounded-sm bg-emerald-900/60 overflow-hidden">
                    <div
                      className={cn(
                        "h-full flex items-center px-2 text-xs font-black text-black transition-all",
                        count > 0 ? "bg-gradient-to-r from-lime-300 to-green-400" : ""
                      )}
                      style={{ width: `${Math.max(width, 0)}%` }}
                    >
                      {count > 0 && count}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {onShare && (
          <button
            onClick={onShare}
            className="mt-3 rounded-lg bg-green-600 text-white font-black text-sm uppercase tracking-wide px-4 py-2 border-2 border-lime-300 hover:scale-[1.02] hover:bg-green-500 transition"
          >
            Share latest result
          </button>
        )}
      </DialogContent>
    </Dialog>
  );
};
