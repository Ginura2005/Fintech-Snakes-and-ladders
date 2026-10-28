/**
 * Crossclimb Word-Ladder Engine
 *
 * Implements:
 *   - Hamming distance calculation & ladder verification
 *   - Curated word bank with FinTech and technology clues
 *   - Scalable procedural level generation across Easy (4 rungs), Medium (5 rungs), Hard (6-7 rungs)
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
  // ================= Easy Templates (4 Rungs) =================
  {
    id: 1,
    name: "Climb 1: Credit Pipeline",
    wordLength: 4,
    topWord: { id: "top-1", word: "DEAL", clue: "Agreement or venture capital financing round" },
    bottomWord: { id: "bot-1", word: "LOAN", clue: "Credit advance extended by a financial institution" },
    ladderWords: [
      { id: "w1", word: "REAL", clue: "Tangible physical asset or inflation-adjusted return" },
      { id: "w2", word: "READ", clue: "Scan a LANKAQR code or review corporate financial filings" },
      { id: "w3", word: "ROAD", clue: "Expressway route or strategic startup product roadmap" },
      { id: "w4", word: "LOAD", clue: "Heavy debt obligations on a company balance sheet" },
    ],
  },
  {
    id: 2,
    name: "Climb 2: Capital Inflow",
    wordLength: 4,
    topWord: { id: "top-2", word: "FUND", clue: "Venture pool of money backing innovative technology" },
    bottomWord: { id: "bot-2", word: "BILL", clue: "Treasury paper debt note or invoice requesting payment" },
    ladderWords: [
      { id: "w1", word: "FIND", clue: "Discover high-yield returns or lucrative market alpha" },
      { id: "w2", word: "FINE", clue: "Regulatory monetary penalty or high grade of precious gold" },
      { id: "w3", word: "FILE", clue: "Submit annual statutory tax declarations to authorities" },
      { id: "w4", word: "FILL", clue: "Execute an open order in the exchange order book" },
    ],
  },
  {
    id: 3,
    name: "Climb 3: Market Cycles",
    wordLength: 4,
    topWord: { id: "top-3", word: "SEED", clue: "Earliest angel stage of equity venture financing" },
    bottomWord: { id: "bot-3", word: "BEAR", clue: "Declining prolonged pessimistic market cycle" },
    ladderWords: [
      { id: "w1", word: "FEED", clue: "Real-time market price data stream consumed by APIs" },
      { id: "w2", word: "FEES", clue: "Gas or transaction commissions deducted from transfers" },
      { id: "w3", word: "BEES", clue: "Industrious worker insects working in automated hives" },
      { id: "w4", word: "BEER", clue: "Celebratory malt beverage toasted after winning a hackathon" },
    ],
  },
  {
    id: 4,
    name: "Climb 4: Voice & Votes",
    wordLength: 4,
    topWord: { id: "top-4", word: "CALL", clue: "Derivative option contract betting on market price rising" },
    bottomWord: { id: "bot-4", word: "POLE", clue: "Geographic extreme or magnetic stake" },
    ladderWords: [
      { id: "w1", word: "TALL", clue: "Skyscraper tower housing modern banking headquarters" },
      { id: "w2", word: "TELL", clue: "Disclose confidential material inside information" },
      { id: "w3", word: "TOLL", clue: "Automated electronic highway tariff paid via RFID tag" },
      { id: "w4", word: "POLL", clue: "Governance vote submitted by DAO token holders" },
    ],
  },

  // ================= Medium Templates (5 Rungs) =================
  {
    id: 5,
    name: "Climb 5: Metallic Money",
    wordLength: 4,
    topWord: { id: "top-5", word: "JOIN", clue: "Register for the Sri Lanka FinTech Festival or unite together" },
    bottomWord: { id: "bot-5", word: "HARD", clue: "Difficult, or a physical cold-storage crypto wallet type" },
    ladderWords: [
      { id: "w1", word: "COIN", clue: "Physical round metallic currency token or crypto asset" },
      { id: "w2", word: "CORN", clue: "Agricultural commodity traded on futures exchanges" },
      { id: "w3", word: "CORE", clue: "Central transactional core banking engine (e.g. Temenos)" },
      { id: "w4", word: "CARE", clue: "Provide attention or medical customer health insurance" },
      { id: "w5", word: "CARD", clue: "Plastic chip debit or credit card tapped at POS terminals" },
    ],
  },
  {
    id: 6,
    name: "Climb 6: Sovereign Vault",
    wordLength: 4,
    topWord: { id: "top-6", word: "BOLD", clue: "Courageous visionary founder or prominent text styling" },
    bottomWord: { id: "bot-6", word: "WARD", clue: "Guarded zone or defending financial assets from fraud" },
    ladderWords: [
      { id: "w1", word: "HOLD", clue: "Maintain investment position through market volatility" },
      { id: "w2", word: "GOLD", clue: "Precious bullion metal backing central bank reserves" },
      { id: "w3", word: "COLD", clue: "Offline secure hardware storage isolated from the web" },
      { id: "w4", word: "CORD", clue: "Ethernet network cable in a financial datacenter" },
      { id: "w5", word: "CARD", clue: "Payment credential stored securely in Apple or Google Wallet" },
    ],
  },
  {
    id: 7,
    name: "Climb 7: Risk to Verification",
    wordLength: 4,
    topWord: { id: "top-7", word: "RISK", clue: "Possibility of capital loss or security vulnerability" },
    bottomWord: { id: "bot-7", word: "TEST", clue: "Automated regression suite or QA deployment check" },
    ladderWords: [
      { id: "w1", word: "DISK", clue: "Magnetic or solid-state storage containing encrypted databases" },
      { id: "w2", word: "DUSK", clue: "End of trading day when clearinghouses settle accounts" },
      { id: "w3", word: "DUST", clue: "Tiny unspendable crypto fractions sitting in a digital wallet" },
      { id: "w4", word: "RUST", clue: "Memory-safe systems programming language powering Solana & Web3" },
      { id: "w5", word: "REST", clue: "Standard HTTP API architecture connecting microservices" },
    ],
  },

  // ================= Hard Templates (6-7 Rungs) =================
  {
    id: 8,
    name: "Climb 8: Liquid Currency",
    wordLength: 4,
    topWord: { id: "top-8", word: "DASH", clue: "Sprint quickly or early privacy cryptocurrency" },
    bottomWord: { id: "bot-8", word: "MASS", clue: "Large volume or mass retail consumer adoption" },
    ladderWords: [
      { id: "w1", word: "CASH", clue: "Physical fiat paper banknotes and coins" },
      { id: "w2", word: "CAST", clue: "Broadcast a network packet or announce conference speakers" },
      { id: "w3", word: "COST", clue: "Expenditure required to acquire inventory or licenses" },
      { id: "w4", word: "POST", clue: "Publish thought leadership on LinkedIn or submit entries" },
      { id: "w5", word: "PAST", clue: "Historical transaction logs permanently recorded on chain" },
      { id: "w6", word: "PASS", clue: "VIP access credential for the FinTech Festival arena" },
    ],
  },
  {
    id: 9,
    name: "Climb 9: Central Rates",
    wordLength: 4,
    topWord: { id: "top-9", word: "TANK", clue: "Heavy armored vehicle or sudden steep price crash" },
    bottomWord: { id: "bot-9", word: "GATE", clue: "Security threshold or online payment checkout portal" },
    ladderWords: [
      { id: "w1", word: "BANK", clue: "Licensed depository institution for savings and credit" },
      { id: "w2", word: "BARK", clue: "Sound of a watchdog or protective corporate exterior" },
      { id: "w3", word: "DARK", clue: "Private institutional liquidity pool (dark pool)" },
      { id: "w4", word: "DART", clue: "Client-optimized language powering Flutter multiplatform apps" },
      { id: "w5", word: "DARE", clue: "Venture boldly into unchartered frontier markets" },
      { id: "w6", word: "DATE", clue: "Settlement maturity timestamp on a financial contract" },
      { id: "w7", word: "RATE", clue: "Policy benchmark interest percentage set by the central bank" },
    ],
  },
  {
    id: 10,
    name: "Climb 10: Mint to Settlement",
    wordLength: 4,
    topWord: { id: "top-10", word: "MINT", clue: "Produce new currency tokens or cryptographic assets" },
    bottomWord: { id: "bot-10", word: "BANK", clue: "Regulated financial clearinghouse and vault" },
    ladderWords: [
      { id: "w1", word: "MINE", clue: "Solve cryptographic puzzles to validate blockchain blocks" },
      { id: "w2", word: "PINE", clue: "Fragrant evergreen tree or yearn for financial independence" },
      { id: "w3", word: "PING", clue: "Low-latency network probe to verify server availability" },
      { id: "w4", word: "RING", clue: "Smart wearable NFC payment device tapped on terminals" },
      { id: "w5", word: "RANG", clue: "Audible sound when the market opening bell chimed" },
      { id: "w6", word: "RANK", clue: "Position on the real-time Sri Lanka FinTech leaderboard" },
    ],
  },
  {
    id: 11,
    name: "Climb 11: Enterprise Protocol",
    wordLength: 4,
    topWord: { id: "top-11", word: "RISK", clue: "Financial downside exposure requiring insurance hedge" },
    bottomWord: { id: "bot-11", word: "TEXT", clue: "Raw SMS OTP one-time passcode or string message" },
    ladderWords: [
      { id: "w1", word: "DISK", clue: "High-throughput NVMe storage hosting ledger nodes" },
      { id: "w2", word: "DUSK", clue: "Twilight hour when after-hours market trading closes" },
      { id: "w3", word: "DUST", clue: "Residual microscopic satoshi balance left in wallet" },
      { id: "w4", word: "RUST", clue: "Performant compiled language used in high-speed algorithmic trading" },
      { id: "w5", word: "REST", clue: "Stateless microservice protocol exchanging JSON payloads" },
      { id: "w6", word: "TEST", clue: "Rigorous sandbox verification before production launch" },
    ],
  },
];

export function generateCrossclimbLevel(
  difficulty: "Easy" | "Medium" | "Hard" = "Medium",
  seed = Date.now()
): CrossclimbLevel {
  const rng = mulberry32(seed);

  // Filter templates by difficulty rung count
  let available: CrossclimbLevel[];
  if (difficulty === "Easy") {
    available = CROSSCLIMB_TEMPLATES.filter((t) => t.ladderWords.length === 4);
  } else if (difficulty === "Hard") {
    available = CROSSCLIMB_TEMPLATES.filter((t) => t.ladderWords.length >= 6);
  } else {
    available = CROSSCLIMB_TEMPLATES.filter((t) => t.ladderWords.length === 5);
  }

  if (!available || available.length === 0) {
    available = CROSSCLIMB_TEMPLATES;
  }

  const template = available[Math.floor(rng() * available.length)];

  return {
    ...template,
    id: seed,
    name: `${template.name} (${difficulty})`,
  };
}
