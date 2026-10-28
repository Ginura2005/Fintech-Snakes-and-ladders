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
import { PuzzleId } from "@/components/puzzles/puzzleTypes";
import { signInWithGoogle } from "@/lib/auth/google-sign-in";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

function PuzzlesContent() {
  const searchParams = useSearchParams();
  const initialGame = searchParams.get("game") as PuzzleId | null;

  const [selectedPuzzle, setSelectedPuzzle] = useState<PuzzleId | null>(initialGame);
  const [user, setUser] = useState<User | null>(null);
  const [signingIn, setSigningIn] = useState(false);
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

  return (
    <div className="min-h-screen bg-[#06061f] text-white flex flex-col selection:bg-[#fec01f] selection:text-black">
      <FestivalHeader
        user={user}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
        signingIn={signingIn}
        activePath="/puzzles"
      />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {selectedPuzzle === null && (
          <PuzzleHub onSelectPuzzle={(id) => setSelectedPuzzle(id)} />
        )}

        {selectedPuzzle === "queens" && (
          <QueensGame onBackToHub={() => setSelectedPuzzle(null)} />
        )}

        {selectedPuzzle === "tango" && (
          <TangoGame onBackToHub={() => setSelectedPuzzle(null)} />
        )}

        {selectedPuzzle === "pinpoint" && (
          <PinpointGame onBackToHub={() => setSelectedPuzzle(null)} />
        )}

        {selectedPuzzle === "crossclimb" && (
          <CrossclimbGame onBackToHub={() => setSelectedPuzzle(null)} />
        )}

        {selectedPuzzle === "zip" && (
          <ZipGame onBackToHub={() => setSelectedPuzzle(null)} />
        )}

        {selectedPuzzle === "mini-sudoku" && (
          <MiniSudokuGame onBackToHub={() => setSelectedPuzzle(null)} />
        )}
      </main>

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
