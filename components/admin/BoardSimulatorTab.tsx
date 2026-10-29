"use client";

import { useState, useEffect } from "react";
import {
  Gamepad2,
  TrendingUp,
  AlertTriangle,
  HelpCircle,
  Gem,
  RotateCcw,
  ArrowUpRight,
  ArrowDownRight,
  Shield,
  Dices,
} from "lucide-react";

interface BoardSimulatorTabProps {
  adminKey?: string;
}

export default function BoardSimulatorTab({ adminKey = "" }: BoardSimulatorTabProps) {
  const [seedInput, setSeedInput] = useState<string>("2026");
  const [boardData, setBoardData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBoard = async (seedStr: string, isClassic = false) => {
    setLoading(true);
    setError(null);
    try {
      const url = isClassic
        ? `/api/admin/board-simulator?classic=true`
        : `/api/admin/board-simulator?seed=${encodeURIComponent(seedStr)}`;

      const res = await fetch(url, {
        headers: adminKey ? { "x-admin-key": adminKey } : {},
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Simulation failed");
      setBoardData(data);
    } catch (err: any) {
      setError(err.message || "Failed to simulate board");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoard("2026", true);
  }, []);

  const handleRunSeed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!seedInput.trim()) return;
    fetchBoard(seedInput.trim(), false);
  };

  const handleClassicPreset = () => {
    setSeedInput("2026");
    fetchBoard("2026", true);
  };

  const handleDailyPreset = () => {
    const today = new Date();
    const y = today.getUTCFullYear();
    const m = String(today.getUTCMonth() + 1).padStart(2, "0");
    const d = String(today.getUTCDate()).padStart(2, "0");
    const dailySeed = `${y}${m}${d}`;
    setSeedInput(dailySeed);
    fetchBoard(dailySeed, false);
  };

  const handleRandomSeed = () => {
    const randomSeed = Math.floor(100000 + Math.random() * 900000).toString();
    setSeedInput(randomSeed);
    fetchBoard(randomSeed, false);
  };

  // Build lookup maps for the 25 squares
  const ladders = boardData?.config?.ladders || [];
  const snakes = boardData?.config?.snakes || [];
  const specialSquares = boardData?.config?.specialSquares || [];

  const ladderMap = new Map<number, { to: number; theme: string }>();
  ladders.forEach((l: any) => ladderMap.set(l.from, { to: l.to, theme: l.theme }));

  const snakeMap = new Map<number, { to: number; type: string }>();
  snakes.forEach((s: any) => snakeMap.set(s.from, { to: s.to, type: s.type }));

  const specialMap = new Map<number, "quiz" | "treasure">();
  specialSquares.forEach((sq: any) => specialMap.set(sq.square, sq.type));

  // 5x5 Serpentine layout coordinates (rows from 5 down to 1)
  // Row 5: 21, 22, 23, 24, 25 (left to right)
  // Row 4: 20, 19, 18, 17, 16 (right to left)
  // Row 3: 11, 12, 13, 14, 15 (left to right)
  // Row 2: 10, 9, 8, 7, 6 (right to left)
  // Row 1: 1, 2, 3, 4, 5 (left to right)
  const serpentineRows = [
    [21, 22, 23, 24, 25],
    [20, 19, 18, 17, 16],
    [11, 12, 13, 14, 15],
    [10, 9, 8, 7, 6],
    [1, 2, 3, 4, 5],
  ];

  return (
    <div className="space-y-8">
      {/* Seed Controller Form */}
      <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-mono uppercase tracking-wider text-white font-bold flex items-center gap-2">
            <Dices size={16} className="text-[#fec01f]" />
            <span>Procedural Board Seed Engine (Mulberry32)</span>
          </h3>
          <p className="text-xs text-white/60 mt-1">
            Test and preview deterministic board configurations for daily tournaments and festival play.
          </p>
        </div>

        <form onSubmit={handleRunSeed} className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={seedInput}
            onChange={(e) => setSeedInput(e.target.value)}
            placeholder="Seed integer..."
            className="w-36 px-3 py-2 bg-white/5 border border-white/20 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-[#fec01f]"
          />

          <button
            type="submit"
            disabled={loading}
            className="py-2 px-3 rounded-xl bg-[#fec01f] text-black font-bold text-xs uppercase font-mono tracking-wider hover:bg-[#e5ac1b] transition-all disabled:opacity-50"
          >
            {loading ? "Generating..." : "Simulate Seed"}
          </button>

          <button
            type="button"
            onClick={handleClassicPreset}
            className="py-2 px-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 text-xs font-mono transition-colors"
          >
            Classic 2026
          </button>

          <button
            type="button"
            onClick={handleDailyPreset}
            className="py-2 px-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 text-xs font-mono transition-colors"
          >
            Today&#39;s Daily
          </button>

          <button
            type="button"
            onClick={handleRandomSeed}
            className="py-2 px-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 text-xs font-mono transition-colors"
          >
            Random
          </button>
        </form>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono">
          {error}
        </div>
      )}

      {/* Simulation Telemetry */}
      {boardData && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
            <span className="text-[10px] font-mono uppercase text-white/50 block">Active Board</span>
            <span className="text-sm font-bold text-[#fec01f] font-mono">
              {boardData.isClassic ? "Classic Festival Default" : `Seed #${boardData.seed}`}
            </span>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
            <span className="text-[10px] font-mono uppercase text-white/50 block">Monte Carlo Avg Turns</span>
            <span className="text-sm font-bold text-white font-mono">
              {boardData.simulation.avgTurns} turns
            </span>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
            <span className="text-[10px] font-mono uppercase text-white/50 block">Min / Max Turns</span>
            <span className="text-sm font-bold text-white font-mono">
              {boardData.simulation.minTurns} min · {boardData.simulation.maxTurns} max
            </span>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
            <span className="text-[10px] font-mono uppercase text-white/50 block">Reachability &amp; Solvability</span>
            <span className="text-sm font-bold text-emerald-400 font-mono">
              {boardData.simulation.solvable ? "100% Solvable" : "Traps Detected"}
            </span>
          </div>
        </div>
      )}

      {/* 5x5 Board Visualizer & Details Split */}
      {boardData && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Board Grid (Left 7 cols) */}
          <div className="lg:col-span-7 bg-[#06061f] border border-white/15 rounded-2xl p-4 sm:p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono uppercase tracking-wider text-white/70">
                5 × 5 Serpentine Grid (25 Squares)
              </span>
              <span className="text-[10px] font-mono text-[#fec01f]">
                Finish: Square 25 (Exact Roll)
              </span>
            </div>

            <div className="grid grid-rows-5 gap-2.5">
              {serpentineRows.map((row, rowIdx) => (
                <div key={rowIdx} className="grid grid-cols-5 gap-2.5">
                  {row.map((sqNum) => {
                    const ladder = ladderMap.get(sqNum);
                    const snake = snakeMap.get(sqNum);
                    const special = specialMap.get(sqNum);
                    const isStart = sqNum === 1;
                    const isFinish = sqNum === 25;

                    return (
                      <div
                        key={sqNum}
                        className={`aspect-square rounded-xl p-2 flex flex-col justify-between border relative overflow-hidden transition-all ${
                          isFinish
                            ? "bg-[#fec01f]/20 border-[#fec01f] text-[#fec01f]"
                            : isStart
                            ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-300"
                            : ladder
                            ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                            : snake
                            ? "bg-rose-500/15 border-rose-500/40 text-rose-300"
                            : special === "quiz"
                            ? "bg-purple-500/15 border-purple-500/40 text-purple-300"
                            : special === "treasure"
                            ? "bg-amber-500/15 border-amber-500/40 text-amber-300"
                            : "bg-white/[0.03] border-white/10 text-white/70"
                        }`}
                      >
                        <span className="text-xs font-bold font-mono">{sqNum}</span>

                        <div className="text-[10px] font-mono leading-tight">
                          {isFinish && <span className="font-bold text-[#fec01f]">FINISH</span>}
                          {isStart && <span className="text-cyan-300">START</span>}
                          {ladder && (
                            <span className="flex items-center gap-0.5 text-emerald-400 font-bold">
                              <ArrowUpRight size={11} />
                              <span>{ladder.to}</span>
                            </span>
                          )}
                          {snake && (
                            <span className="flex items-center gap-0.5 text-rose-400 font-bold">
                              <ArrowDownRight size={11} />
                              <span>{snake.to}</span>
                            </span>
                          )}
                          {special === "quiz" && (
                            <span className="text-purple-300 flex items-center gap-0.5">
                              <HelpCircle size={10} />
                              <span>Quiz</span>
                            </span>
                          )}
                          {special === "treasure" && (
                            <span className="text-amber-300 flex items-center gap-0.5">
                              <Gem size={10} />
                              <span>Treasure</span>
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Details Legend & Theme Lists (Right 5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Ladders List */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
              <h4 className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold mb-3 flex items-center gap-1.5">
                <ArrowUpRight size={14} />
                <span>Ladders ({ladders.length})</span>
              </h4>
              <div className="space-y-2">
                {ladders.map((l: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono flex items-center justify-between"
                  >
                    <span className="font-bold text-white">
                      Sq {l.from} → Sq {l.to}
                    </span>
                    <span className="text-emerald-300 text-[11px] truncate max-w-[140px]">
                      {l.theme}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Snakes List */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
              <h4 className="text-xs font-mono uppercase tracking-wider text-rose-400 font-bold mb-3 flex items-center gap-1.5">
                <ArrowDownRight size={14} />
                <span>Snakes ({snakes.length})</span>
              </h4>
              <div className="space-y-2">
                {snakes.map((s: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs font-mono flex items-center justify-between"
                  >
                    <span className="font-bold text-white">
                      Sq {s.from} → Sq {s.to}
                    </span>
                    <span className="text-rose-300 text-[11px] capitalize">
                      {s.type === "major" ? "Major Risk (-1 Heart)" : "Ordinary Risk (-10 pts)"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Special Squares */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 text-xs font-mono">
              <h4 className="text-xs uppercase tracking-wider text-[#fec01f] font-bold mb-3">
                Special Squares
              </h4>
              <div className="flex flex-wrap gap-2">
                {specialSquares.map((sq: any, idx: number) => (
                  <span
                    key={idx}
                    className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold ${
                      sq.type === "quiz"
                        ? "bg-purple-500/15 border-purple-500/30 text-purple-300"
                        : "bg-amber-500/15 border-amber-500/30 text-amber-300"
                    }`}
                  >
                    Sq {sq.square} ({sq.type})
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
