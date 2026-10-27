"use client";

interface DicePanelProps {
  isPlayerTurn: boolean;
  rolling: boolean;
  lastRoll: number | null;
  computerRoll: number | null;
  onRoll: () => void;
  disabled: boolean;
  playerPosition?: number;
}

const DOT_POSITIONS: Record<number, string[]> = {
  1: ["col-start-2 row-start-2"],
  2: ["col-start-1 row-start-1", "col-start-3 row-start-3"],
  3: ["col-start-1 row-start-1", "col-start-2 row-start-2", "col-start-3 row-start-3"],
  4: [
    "col-start-1 row-start-1",
    "col-start-3 row-start-1",
    "col-start-1 row-start-3",
    "col-start-3 row-start-3",
  ],
  5: [
    "col-start-1 row-start-1",
    "col-start-3 row-start-1",
    "col-start-2 row-start-2",
    "col-start-1 row-start-3",
    "col-start-3 row-start-3",
  ],
  6: [
    "col-start-1 row-start-1",
    "col-start-3 row-start-1",
    "col-start-1 row-start-2",
    "col-start-3 row-start-2",
    "col-start-1 row-start-3",
    "col-start-3 row-start-3",
  ],
};

function DieFace({
  value,
  isRolling,
  color = "teal",
}: {
  value: number | null;
  isRolling: boolean;
  color?: "teal" | "burgundy";
}) {
  const dots = value && DOT_POSITIONS[value] ? DOT_POSITIONS[value] : [];
  const dotColor = color === "teal" ? "bg-[#fec01f] shadow-[0_0_8px_rgba(254,192,31,0.8)]" : "bg-[#fb7185] shadow-[0_0_8px_rgba(251,113,133,0.8)]";
  const borderColor = color === "teal" ? "border-[#fec01f]/60 bg-[#0e0e36]" : "border-rose-500/60 bg-[#1f0b14]";

  return (
    <div
      className={`
        w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border-2 ${borderColor}
        shadow-[0_8px_20px_rgba(0,0,0,0.6)] flex items-center justify-center p-2.5 transition-all duration-200
        ${isRolling ? "animate-spin" : "hover:scale-105"}
      `}
    >
      {value ? (
        <div className="grid grid-cols-3 grid-rows-3 w-full h-full gap-0.5">
          {dots.map((pos, idx) => (
            <div key={idx} className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${dotColor} ${pos}`} />
          ))}
        </div>
      ) : (
        <span className="text-2xl text-white/40">🎲</span>
      )}
    </div>
  );
}

export default function DicePanel({
  isPlayerTurn,
  rolling,
  lastRoll,
  computerRoll,
  onRoll,
  disabled,
  playerPosition = 1,
}: DicePanelProps) {
  const neededToFinish = 25 - playerPosition;

  return (
    <div className="festival-card p-4 sm:p-5 border-2 border-white/15 bg-[#0a0a28]/90">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
        {/* Dice visualizers */}
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-center">
            <span className="font-mono text-[10px] font-bold text-[#fec01f] uppercase tracking-wider mb-2">
              Your Die
            </span>
            <DieFace value={lastRoll} isRolling={rolling} color="teal" />
          </div>

          {computerRoll !== null && (
            <div className="flex flex-col items-center">
              <span className="font-mono text-[10px] font-bold text-rose-400 uppercase tracking-wider mb-2">
                Computer
              </span>
              <DieFace value={computerRoll} isRolling={false} color="burgundy" />
            </div>
          )}
        </div>

        {/* Action button & turn instructions */}
        <div className="flex flex-col items-center sm:items-end w-full sm:w-auto">
          {isPlayerTurn ? (
            <button
              onClick={onRoll}
              disabled={rolling || disabled}
              className={`
                w-full sm:w-auto px-8 py-3.5 rounded-xl font-heading font-extrabold text-base
                transition-all duration-200 shadow-lg flex items-center justify-center gap-3
                ${
                  rolling || disabled
                    ? "bg-white/10 text-white/40 border border-white/10 cursor-not-allowed"
                    : "interactive-btn interactive-btn--primary shadow-[0_0_25px_rgba(254,192,31,0.4)] cursor-pointer"
                }
              `}
            >
              {rolling ? (
                <>
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span className="font-mono text-sm tracking-wider uppercase">Rolling Authoritative Die…</span>
                </>
              ) : (
                <>
                  <span>🎲</span>
                  <span className="tracking-wider uppercase">ROLL THE DIE</span>
                </>
              )}
            </button>
          ) : (
            <div className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2.5">
              <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
              <span>Computer is rolling…</span>
            </div>
          )}

          {/* Context tip */}
          <div className="mt-2 text-xs font-mono text-white/60 text-center sm:text-right">
            {playerPosition >= 19 ? (
              <span className="text-[#fec01f] font-semibold">
                🎯 Exactly {neededToFinish} needed to reach finish! (overshooting stays in place)
              </span>
            ) : (
              <span>Roll 1–6 to advance toward square 25.</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
