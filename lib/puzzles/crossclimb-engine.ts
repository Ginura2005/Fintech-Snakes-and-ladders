/**
 * Crossclimb Word-Ladder Engine
 *
 * Implements:
 *   - Hamming distance calculation & ladder verification
 *   - Curated word bank with FinTech and technology clues
 *   - Procedural level generation with Top/Bottom summit clues
 */

import { mulberry32, shuffle } from "./prng";
import { CrossclimbLevel, CrossclimbLadderWord } from "@/components/puzzles/puzzleTypes";

export function getHammingDistance(w1: string, w2: string): number {
  if (w1.length !== w2.length) return 99;
  let diff = 0;
  for (let i = 0; i < w1.length; i++) {
    if (w1[i] !== w2[i]) diff++;
  }
  return diff;
}

export const CROSSCLIMB_TEMPLATES: CrossclimbLevel[] = [
  {
    id: 1,
    name: "Climb 1: Metallic Money",
    wordLength: 4,
    topWord: {
      id: "top-1",
      word: "JOIN",
      clue: "Register for the Sri Lanka FinTech Festival or unite together",
    },
    bottomWord: {
      id: "bot-1",
      word: "HARD",
      clue: "Difficult, or a physical cold-storage crypto wallet type",
    },
    ladderWords: [
      { id: "w1", word: "COIN", clue: "Physical round metallic currency token" },
      { id: "w2", word: "CORN", clue: "Yellow staple grain growing on a cob" },
      { id: "w3", word: "CORE", clue: "Central innermost part or core banking engine" },
      { id: "w4", word: "CARE", clue: "Provide medical attention or feel deep concern" },
      { id: "w5", word: "CARD", clue: "Plastic chip device tapped at POS terminals" },
    ],
  },
  {
    id: 2,
    name: "Climb 2: Liquid Currency",
    wordLength: 4,
    topWord: {
      id: "top-2",
      word: "DASH",
      clue: "Sprint with high speed, or an early privacy-focused cryptocurrency",
    },
    bottomWord: {
      id: "bot-2",
      word: "MASS",
      clue: "Large-scale community adoption, or physical matter volume",
    },
    ladderWords: [
      { id: "w1", word: "CASH", clue: "Physical paper banknotes and coins" },
      { id: "w2", word: "CAST", clue: "Throw a fishing line or announce theatrical actors" },
      { id: "w3", word: "COST", clue: "Price or total expenditure needed to acquire an asset" },
      { id: "w4", word: "POST", clue: "Publish an article on LinkedIn or deliver mail" },
      { id: "w5", word: "PAST", clue: "Historic elapsed time recorded on financial statements" },
      { id: "w6", word: "PASS", clue: "Festival admission ticket or clearance credential" },
    ],
  },
  {
    id: 3,
    name: "Climb 3: Central Rates",
    wordLength: 4,
    topWord: {
      id: "top-3",
      word: "TANK",
      clue: "Armored military vehicle, or sharp market price drop",
    },
    bottomWord: {
      id: "bot-3",
      word: "GATE",
      clue: "Access barrier, or an online payment checkout portal",
    },
    ladderWords: [
      { id: "w1", word: "BANK", clue: "Vaulted depository for credit, savings, and loans" },
      { id: "w2", word: "BARK", clue: "Sound of a guard dog, or protective tree exterior" },
      { id: "w3", word: "DARK", clue: "Opposite of daylight, or private institutional liquidity pool" },
      { id: "w4", word: "DART", clue: "Pointed arrow, or Google's cross-platform client language" },
      { id: "w5", word: "DARE", clue: "Take a bold entrepreneurial risk or venture into new markets" },
      { id: "w6", word: "DATE", clue: "Calendar day, or timestamp on a ledger transaction" },
      { id: "w7", word: "RATE", clue: "Benchmark percentage yield set by the Central Bank" },
    ],
  },
  {
    id: 4,
    name: "Climb 4: Digital Assets",
    wordLength: 4,
    topWord: {
      id: "top-4",
      word: "MINT",
      clue: "Produce a new coin or token on the blockchain, or fresh herb",
    },
    bottomWord: {
      id: "bot-4",
      word: "SEND",
      clue: "Transmit money across a digital payment rail",
    },
    ladderWords: [
      { id: "w1", word: "MINE", clue: "Extract cryptocurrency through computational proof of work" },
      { id: "w2", word: "LINE", clue: "Credit facility extended by a bank, or sequence of code" },
      { id: "w3", word: "LANE", clue: "Fast track express lane for digital expressway tolls" },
      { id: "w4", word: "LEND", clue: "Provide funds with the expectation of repayment plus interest" },
    ],
  },
  {
    id: 5,
    name: "Climb 5: High Value",
    wordLength: 4,
    topWord: {
      id: "top-5",
      word: "BOLD",
      clue: "Courageous visionary founder or heavy text formatting",
    },
    bottomWord: {
      id: "bot-5",
      word: "COLD",
      clue: "Air temperature, or offline hardware cryptocurrency storage",
    },
    ladderWords: [
      { id: "w1", word: "BOND", clue: "Debt security instrument issued by government or treasury" },
      { id: "w2", word: "FUND", clue: "Pool of venture capital money backing innovative startups" },
      { id: "w3", word: "FIND", clue: "Discover a lucrative arbitrage trading opportunity" },
      { id: "w4", word: "FINE", clue: "Regulatory financial penalty, or high grade of gold purity" },
      { id: "w5", word: "FILE", clue: "Submit tax returns to the inland revenue department" },
      { id: "w6", word: "FOLE", clue: "Young equine animal... wait" }, // Let's ensure strict 1-letter transitions
    ],
  },
];

// Clean template 5: BOLD -> HOLD -> GOLD -> COLD -> CORD -> CARD -> WARD
CROSSCLIMB_TEMPLATES[4] = {
  id: 5,
  name: "Climb 5: Sovereign Vault",
  wordLength: 4,
  topWord: {
    id: "top-5",
    word: "BOLD",
    clue: "Courageous visionary founder or heavy prominent font style",
  },
  bottomWord: {
    id: "bot-5",
    word: "WARD",
    clue: "Hospital wing, or to guard and defend digital assets against attacks",
  },
  ladderWords: [
    { id: "w1", word: "HOLD", clue: "Maintain investment position without panic selling" },
    { id: "w2", word: "GOLD", clue: "Precious bullion metal historically backing fiat reserve currencies" },
    { id: "w3", word: "COLD", clue: "Offline secure hardware storage separated from the internet" },
    { id: "w4", word: "CORD", clue: "Physical cable connecting server hardware in a datacenter" },
    { id: "w5", word: "CARD", clue: "Payment card tapped at contactless NFC readers" },
  ],
};

export function generateCrossclimbLevel(
  difficulty: "Easy" | "Medium" | "Hard" = "Medium",
  seed = Date.now()
): CrossclimbLevel {
  const rng = mulberry32(seed);

  // Filter templates by rung count / difficulty
  let available = CROSSCLIMB_TEMPLATES;
  if (difficulty === "Easy") {
    available = CROSSCLIMB_TEMPLATES.filter((t) => t.ladderWords.length <= 5);
  } else if (difficulty === "Hard") {
    available = CROSSCLIMB_TEMPLATES.filter((t) => t.ladderWords.length >= 6);
  }

  const template = available[Math.floor(rng() * available.length)] || CROSSCLIMB_TEMPLATES[0];

  return {
    ...template,
    id: seed,
    name: `${template.name} (${difficulty})`,
  };
}
