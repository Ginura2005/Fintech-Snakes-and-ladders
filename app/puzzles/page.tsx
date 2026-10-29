"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import FestivalHeader from "@/components/layout/FestivalHeader";
import FestivalFooter from "@/components/layout/FestivalFooter";
import PuzzleHub from "@/components/puzzles/PuzzleHub";
import QueensGame from "@/components/puzzles/QueensGame";
import TangoGame from "@/components/puzzles/TangoGame";
import PinpointGame from "@/components/puzzles/PinpointGame";
import CrossclimbGame from "@/components/puzzles/CrossclimbGame";
import ZipGame from "@/components/puzzles/ZipGame";
import MiniSudokuGame from "@/components/puzzles/MiniSudokuGame";
import FintechCodexDrawer from "@/components/puzzles/FintechCodexDrawer";
import { PuzzleId } from "@/components/puzzles/puzzleTypes";
import { signInWithGoogle } from "@/lib/auth/google-sign-in";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { getPuzzleStats } from "@/lib/puzzles/puzzle-storage";
import { sounds } from "@/lib/audio/sound-effects";

function PuzzlesContent() {
  const searchParams = useSearchParams();
  const initialGame = searchParams.get("game") as PuzzleId | null;
  const seedParam = searchParams.get("seed");
  const challengeParam = searchParams.get("challenge") === "1";
  const targetParam = searchParams.get("target");
  const fromParam = searchParams.get("from");
  const diffParam = searchParams.get("diff");
  const dateParam = searchParams.get("date");

  const [selectedPuzzle, setSelectedPuzzle] = useState<PuzzleId | null>(initialGame);
  const [selectedDate, setSelectedDate] = useState<string>(
    dateParam || new Date().toISOString().split("T")[0]
  );
  const [user, setUser] = useState<User | null>(null);
  const [signingIn, setSigningIn] = useState(false);
  const [showCodex, setShowCodex] = useState(false);
  const [stats, setStats] = useState(() => getPuzzleStats());
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();
  }, [supabase.auth]);

  // If a 1v1 challenge link is detected, play challenger alert sound
  useEffect(() => {
    if (challengeParam && initialGame) {
      sounds.playChallengerAlert();
    }
  }, [challengeParam, initialGame]);

  const handleSignIn = async () => {
    setSigningIn(true);
    try {
      await signInWithGoogle(supabase, {
        nextUrl: "/puzzles",
        onError: () => setSigningIn(false),
      });
    } catch {
      setSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const challengeInfo =
    challengeParam && targetParam
      ? {
          challengerName: fromParam || "Colleague",
          targetSeconds: Number(targetParam) || 60,
          seed: Number(seedParam) || 0,
          difficulty: diffParam || undefined,
        }
      : null;

  const customSeed = seedParam ? Number(seedParam) : undefined;

  const handleSelectPuzzle = (id: PuzzleId, dateStr?: string) => {
    if (dateStr) setSelectedDate(dateStr);
    setSelectedPuzzle(id);
  };

  const handleBackToHub = () => {
    setStats(getPuzzleStats());
    setSelectedPuzzle(null);
  };

  return (
    <div className="min-h-screen bg-[#06061f] text-white flex flex-col selection:bg-[#fec01f] selection:text-black">
      <FestivalHeader
        user={user}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
        signingIn={signingIn}
        activePath="/puzzles"
      />

      <main className="flex-1 mx-auto w-full max-w-7xl px-3 sm:px-6 lg:px-8 py-5 sm:py-12">
        {selectedPuzzle === null && (
          <PuzzleHub
            onSelectPuzzle={handleSelectPuzzle}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
        )}

        {selectedPuzzle === "queens" && (
          <QueensGame
            onBackToHub={handleBackToHub}
            customSeed={customSeed}
            challengeInfo={challengeInfo}
            dateStr={selectedDate}
            onOpenCodex={() => setShowCodex(true)}
          />
        )}

        {selectedPuzzle === "tango" && (
          <TangoGame
            onBackToHub={handleBackToHub}
            customSeed={customSeed}
            challengeInfo={challengeInfo}
            dateStr={selectedDate}
            onOpenCodex={() => setShowCodex(true)}
          />
        )}

        {selectedPuzzle === "pinpoint" && (
          <PinpointGame
            onBackToHub={handleBackToHub}
            customSeed={customSeed}
            challengeInfo={challengeInfo}
            dateStr={selectedDate}
            onOpenCodex={() => setShowCodex(true)}
          />
        )}

        {selectedPuzzle === "crossclimb" && (
          <CrossclimbGame
            onBackToHub={handleBackToHub}
            customSeed={customSeed}
            challengeInfo={challengeInfo}
            dateStr={selectedDate}
            onOpenCodex={() => setShowCodex(true)}
          />
        )}

        {selectedPuzzle === "zip" && (
          <ZipGame
            onBackToHub={handleBackToHub}
            customSeed={customSeed}
            challengeInfo={challengeInfo}
            dateStr={selectedDate}
            onOpenCodex={() => setShowCodex(true)}
          />
        )}

        {selectedPuzzle === "mini-sudoku" && (
          <MiniSudokuGame
            onBackToHub={handleBackToHub}
            customSeed={customSeed}
            challengeInfo={challengeInfo}
            dateStr={selectedDate}
            onOpenCodex={() => setShowCodex(true)}
          />
        )}
      </main>

      {/* Global FinTech Codex Drawer */}
      {showCodex && (
        <FintechCodexDrawer
          unlockedIds={stats.unlockedCodexCards || []}
          onClose={() => setShowCodex(false)}
        />
      )}

      <FestivalFooter />
    </div>
  );
}

export default function PuzzlesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#06061f] flex items-center justify-center">
          <LoadingSpinner size="lg" label="Loading FinTech Puzzles Arena..." />
        </div>
      }
    >
      <PuzzlesContent />
    </Suspense>
  );
}
