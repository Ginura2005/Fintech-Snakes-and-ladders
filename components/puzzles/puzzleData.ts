import {
  PuzzleMeta,
  QueensLevel,
  TangoLevel,
  PinpointPack,
  CrossclimbLevel,
  ZipLevel,
  MiniSudokuLevel,
} from "./puzzleTypes";

export const PUZZLES_META: PuzzleMeta[] = [
  {
    id: "queens",
    title: "Queens",
    subtitle: "Logic Placement",
    badge: "LinkedIn Hit #1",
    icon: "crown",
    tagline: "Rule the board without crowns colliding",
    description:
      "Place exactly one crown in every row, column, and color region. No two crowns can touch horizontally, vertically, or diagonally.",
    difficulty: "Adaptive",
    estimatedTime: "2-4 min",
    color: "#fec01f",
  },
  {
    id: "tango",
    title: "Tango",
    subtitle: "Sun & Moon Binary Logic",
    badge: "Binary Grid",
    icon: "sun",
    tagline: "Balance the cosmic celestial forces",
    description:
      "Fill the 6x6 grid with equal Suns and Moons per row and column. Avoid 3 consecutive identical symbols and satisfy the = and × constraints.",
    difficulty: "Medium",
    estimatedTime: "3-5 min",
    color: "#00f0ff",
  },
  {
    id: "pinpoint",
    title: "Pinpoint",
    subtitle: "5-Clue Category Mystery",
    badge: "Word Trivia",
    icon: "target",
    tagline: "Guess the hidden theme with fewest clues",
    description:
      "Uncover 5 progressive clues that point to a single secret FinTech or tech category. Guess early to earn the highest score!",
    difficulty: "Easy",
    estimatedTime: "1-3 min",
    color: "#2dd4bf",
  },
  {
    id: "crossclimb",
    title: "Crossclimb",
    subtitle: "Word-Ladder Trivia Climb",
    badge: "Word Climb",
    icon: "trending-up",
    tagline: "Bridge the ladder rung by single letter",
    description:
      "Solve trivia clues for equal-length words and arrange them into a ladder where each rung differs by only 1 letter. Unlock the top and bottom words!",
    difficulty: "Medium",
    estimatedTime: "3-5 min",
    color: "#a78bfa",
  },
  {
    id: "zip",
    title: "Zip",
    subtitle: "Complete Path Waypoint Maze",
    badge: "Single Trail",
    icon: "zap",
    tagline: "Trace one line through every square",
    description:
      "Draw a single continuous line that starts at 1, visits all numbered waypoints in numerical order, and covers 100% of the squares on the board.",
    difficulty: "Medium",
    estimatedTime: "2-4 min",
    color: "#f43f5e",
  },
  {
    id: "mini-sudoku",
    title: "Mini Sudoku",
    subtitle: "6x6 Fast Logic Grid",
    badge: "Number Grid",
    icon: "binary",
    tagline: "Fast-paced coffee break number crunch",
    description:
      "Fill the 6x6 grid with numbers 1 to 6. Every row, column, and 2x3 block must have numbers 1-6 with zero repeats.",
    difficulty: "Adaptive",
    estimatedTime: "2-3 min",
    color: "#fb923c",
  },
];

// ==========================================
// 1. QUEENS LEVELS
// ==========================================
export const QUEENS_LEVELS: QueensLevel[] = [
  {
    id: 1,
    name: "Level 1 (6x6 Easy)",
    size: 6,
    regions: [
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 1, 0, 0],
      [4, 4, 1, 1, 0, 2],
      [3, 4, 1, 1, 2, 2],
      [3, 4, 4, 5, 2, 2],
      [3, 3, 3, 5, 5, 2],
    ],
    solution: [1, 3, 5, 0, 2, 4],
  },
  {
    id: 2,
    name: "Level 2 (7x7 Medium)",
    size: 7,
    regions: [
      [2, 2, 0, 2, 2, 1, 1],
      [2, 2, 2, 2, 2, 1, 1],
      [2, 2, 2, 2, 3, 3, 3],
      [2, 2, 2, 3, 3, 3, 3],
      [4, 2, 3, 3, 3, 3, 3],
      [2, 2, 3, 5, 3, 3, 3],
      [2, 2, 3, 3, 3, 3, 6],
    ],
    solution: [2, 5, 1, 4, 0, 3, 6],
  },
  {
    id: 3,
    name: "Level 3 (8x8 Hard)",
    size: 8,
    regions: [
      [0, 0, 0, 0, 0, 0, 0, 3],
      [4, 0, 2, 2, 2, 0, 1, 3],
      [4, 0, 2, 0, 0, 0, 1, 3],
      [4, 2, 2, 2, 2, 2, 2, 3],
      [4, 4, 4, 7, 7, 7, 2, 3],
      [6, 4, 7, 7, 5, 7, 2, 3],
      [6, 4, 7, 7, 7, 7, 2, 3],
      [6, 6, 6, 7, 7, 7, 7, 3],
    ],
    solution: [3, 6, 2, 7, 1, 4, 0, 5],
  },
];

// ==========================================
// 2. TANGO LEVELS
// ==========================================
export const TANGO_LEVELS: TangoLevel[] = [
  {
    id: 1,
    name: "Level 1 (Novice)",
    size: 6,
    givens: [
      ["S", null, null, null, null, null],
      [null, "M", null, null, null, null],
      ["S", null, null, null, "M", null],
      [null, null, "M", null, null, null],
      ["S", null, null, null, null, null],
      [null, null, null, null, null, "S"],
    ],
    hEdges: [
      ["=", "x", null, null, null],
      [null, null, null, null, "x"],
      [null, null, null, "=", null],
      ["x", null, null, null, null],
      ["=", null, null, null, null],
      [null, null, null, null, null],
    ],
    vEdges: [
      ["x", null, null, null, null, null],
      [null, null, "=", null, null, null],
      [null, null, null, null, null, "x"],
      [null, null, null, null, "x", null],
      [null, "x", null, null, null, null],
    ],
    solution: [
      ["S", "S", "M", "M", "S", "M"],
      ["M", "M", "S", "S", "M", "S"],
      ["S", "M", "S", "M", "M", "S"],
      ["M", "S", "M", "S", "S", "M"],
      ["S", "S", "M", "S", "M", "M"],
      ["M", "M", "S", "M", "S", "S"],
    ],
  },
  {
    id: 2,
    name: "Level 2 (Expert)",
    size: 6,
    givens: [
      ["S", null, null, null, null, null],
      [null, null, null, "M", null, null],
      [null, "M", null, null, null, null],
      [null, null, null, null, null, "M"],
      [null, null, "S", null, null, null],
      [null, null, null, null, "M", null],
    ],
    hEdges: [
      ["=", null, "=", null, null],
      [null, "x", null, null, null],
      ["=", null, null, null, null],
      ["=", null, null, null, null],
      [null, null, null, null, "="],
      ["x", null, null, null, null],
    ],
    vEdges: [
      [null, "=", null, null, null, null],
      [null, null, null, null, "x", null],
      [null, null, null, "=", null, null],
      [null, null, "x", null, null, null],
      [null, null, null, null, null, "x"],
    ],
    solution: [
      ["S", "S", "M", "M", "S", "M"],
      ["M", "S", "M", "M", "S", "S"],
      ["M", "M", "S", "S", "M", "S"],
      ["S", "S", "M", "S", "M", "M"],
      ["M", "M", "S", "M", "S", "S"],
      ["S", "M", "S", "S", "M", "M"],
    ],
  },
];

// ==========================================
// 3. PINPOINT PACKS
// ==========================================
export const PINPOINT_PACKS: PinpointPack[] = [
  {
    id: 1,
    topic: "Digital Payment Rails",
    category: "Payment Methods",
    acceptedAnswers: [
      "payment methods",
      "digital payment methods",
      "payment systems",
      "payment options",
      "ways to pay",
      "payment rails",
      "digital payments",
      "payments",
    ],
    clues: [
      "Bank Wire Transfer",
      "Credit & Debit Cards",
      "Apple Pay & Google Wallet",
      "LankaPay LANKAQR Code",
      "Cryptocurrency & Stablecoins",
    ],
    explanation:
      "All 5 items are mechanisms and payment rails used globally and in Sri Lanka to settle financial transactions.",
  },
  {
    id: 2,
    topic: "Global FinTech Giants",
    category: "FinTech Unicorns",
    acceptedAnswers: [
      "fintech unicorns",
      "fintech companies",
      "fintech startups",
      "fintechs",
      "payment companies",
      "neobanks",
      "financial technology companies",
    ],
    clues: [
      "Klarna (Buy Now Pay Later pioneer)",
      "Revolut (Digital Neo-Banking)",
      "Stripe (Global Developer Payments)",
      "Nubank (Latin America's Mega Digital Bank)",
      "Checkout.com (Cloud Payment Processing)",
    ],
    explanation:
      "Each of these companies achieved multi-billion dollar FinTech unicorn valuation transforming modern banking.",
  },
  {
    id: 3,
    topic: "Blockchain Core Architecture",
    category: "Consensus Mechanisms",
    acceptedAnswers: [
      "consensus mechanisms",
      "blockchain consensus",
      "consensus algorithms",
      "crypto consensus",
      "proof of",
      "proof mechanisms",
      "consensus protocols",
    ],
    clues: [
      "Proof of Work (Bitcoin)",
      "Proof of Stake (Ethereum 2.0)",
      "Proof of History (Solana)",
      "Delegated Proof of Stake (Tron/EOS)",
      "Proof of Authority (Private Enterprise)",
    ],
    explanation:
      "These are decentralized protocols that network validators use to agree on the valid state of a blockchain ledger.",
  },
  {
    id: 4,
    topic: "Sri Lankan Financial Pillars",
    category: "Sri Lankan Commercial Banks",
    acceptedAnswers: [
      "sri lankan banks",
      "banks in sri lanka",
      "commercial banks in sri lanka",
      "sri lankan commercial banks",
      "commercial banks",
      "banks",
      "licensed commercial banks",
    ],
    clues: [
      "Bank of Ceylon (BOC - State Banking Giant)",
      "Commercial Bank of Ceylon (COMBANK)",
      "Hatton National Bank (HNB)",
      "Sampath Bank (Digital Banking Innovator)",
      "Nations Trust Bank (FriMi Pioneer)",
    ],
    explanation:
      "Leading Licensed Commercial Banks driving financial inclusion and digital payments across Sri Lanka.",
  },
  {
    id: 5,
    topic: "Distributed Ledger Primitives",
    category: "Components of a Blockchain Block",
    acceptedAnswers: [
      "components of a block",
      "blockchain block header",
      "parts of a block",
      "block components",
      "blockchain primitives",
      "block structure",
      "blockchain structure",
    ],
    clues: [
      "Genesis Block (Block 0)",
      "Merkle Tree Root Hash",
      "Cryptographic SHA-256 Hash",
      "32-Bit Miner Nonce",
      "Smart Contract Bytecode",
    ],
    explanation:
      "Essential cryptographic building blocks and fields that compose verified blocks on a distributed blockchain ledger.",
  },
];

// ==========================================
// 4. CROSSCLIMB LEVELS
// ==========================================
export const CROSSCLIMB_LEVELS: CrossclimbLevel[] = [
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
      { id: "w5", word: "DARE", clue: "Take a bold entrepreneurial risk or challenge" },
      { id: "w6", word: "DATE", clue: "Calendar day, or timestamp on a ledger transaction" },
      { id: "w7", word: "RATE", clue: "Benchmark percentage yield set by the Central Bank" },
    ],
  },
];

// ==========================================
// 5. ZIP LEVELS
// ==========================================
export const ZIP_LEVELS: ZipLevel[] = [
  {
    id: 1,
    name: "Level 1: 5x5 Circuit",
    rows: 5,
    cols: 5,
    waypoints: [
      { step: 1, row: 0, col: 0 },
      { step: 2, row: 4, col: 0 },
      { step: 3, row: 0, col: 1 },
      { step: 4, row: 4, col: 2 },
      { step: 5, row: 2, col: 3 },
      { step: 6, row: 1, col: 3 },
    ],
    solutionPath: [
      [0, 0], [1, 0], [2, 0], [3, 0], [4, 0],
      [4, 1], [3, 1], [2, 1], [1, 1], [0, 1],
      [0, 2], [1, 2], [2, 2], [3, 2], [4, 2],
      [4, 3], [4, 4], [3, 4], [3, 3], [2, 3],
      [2, 4], [1, 4], [0, 4], [0, 3], [1, 3],
    ],
  },
  {
    id: 2,
    name: "Level 2: 6x6 FinTech Mesh",
    rows: 6,
    cols: 6,
    waypoints: [
      { step: 1, row: 0, col: 0 },
      { step: 2, row: 5, col: 1 },
      { step: 3, row: 1, col: 2 },
      { step: 4, row: 3, col: 3 },
      { step: 5, row: 1, col: 4 },
      { step: 6, row: 4, col: 5 },
    ],
    solutionPath: [
      [0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0],
      [5, 1], [4, 1], [3, 1], [2, 1], [1, 1], [0, 1],
      [0, 2], [1, 2], [2, 2], [3, 2], [4, 2], [5, 2],
      [5, 3], [4, 3], [3, 3], [2, 3], [1, 3], [0, 3],
      [0, 4], [0, 5], [1, 5], [1, 4], [2, 4], [2, 5],
      [3, 5], [3, 4], [4, 4], [5, 4], [5, 5], [4, 5],
    ],
  },
];

// ==========================================
// 6. MINI SUDOKU LEVELS
// ==========================================
export const MINI_SUDOKU_LEVELS: MiniSudokuLevel[] = [
  {
    id: 1,
    name: "Level 1: Quick Sprint",
    difficulty: "Easy",
    givens: [
      [0, 0, 3, 4, 5, 0],
      [0, 0, 0, 1, 0, 3],
      [0, 0, 1, 5, 6, 4],
      [0, 6, 0, 0, 0, 0],
      [0, 1, 0, 6, 4, 0],
      [0, 4, 5, 3, 0, 0],
    ],
    solution: [
      [1, 2, 3, 4, 5, 6],
      [4, 5, 6, 1, 2, 3],
      [2, 3, 1, 5, 6, 4],
      [5, 6, 4, 2, 3, 1],
      [3, 1, 2, 6, 4, 5],
      [6, 4, 5, 3, 1, 2],
    ],
  },
  {
    id: 2,
    name: "Level 2: Strategic Balance",
    difficulty: "Medium",
    givens: [
      [1, 0, 0, 0, 0, 0],
      [0, 5, 6, 1, 0, 0],
      [2, 0, 1, 5, 6, 0],
      [0, 0, 0, 0, 3, 0],
      [0, 0, 0, 6, 0, 0],
      [0, 4, 5, 0, 0, 0],
    ],
    solution: [
      [1, 2, 3, 4, 5, 6],
      [4, 5, 6, 1, 2, 3],
      [2, 3, 1, 5, 6, 4],
      [5, 6, 4, 2, 3, 1],
      [3, 1, 2, 6, 4, 5],
      [6, 4, 5, 3, 1, 2],
    ],
  },
  {
    id: 3,
    name: "Level 3: Master Tactician",
    difficulty: "Hard",
    givens: [
      [1, 0, 0, 0, 0, 6],
      [0, 5, 0, 0, 0, 0],
      [0, 3, 0, 0, 0, 0],
      [0, 0, 4, 2, 0, 0],
      [3, 0, 0, 0, 4, 5],
      [0, 4, 0, 0, 1, 0],
    ],
    solution: [
      [1, 2, 3, 4, 5, 6],
      [4, 5, 6, 1, 2, 3],
      [2, 3, 1, 5, 6, 4],
      [5, 6, 4, 2, 3, 1],
      [3, 1, 2, 6, 4, 5],
      [6, 4, 5, 3, 1, 2],
    ],
  },
];
