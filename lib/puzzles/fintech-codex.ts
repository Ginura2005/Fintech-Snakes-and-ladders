/**
 * FinTech Codex — Collectible Intelligence & Knowledge Cards
 * Unlocked by solving LinkedIn daily puzzles in the Lanka FinTechverse.
 */

export type CodexCategory =
  | "payment-rails"
  | "central-banking"
  | "security-crypto"
  | "defi-markets"
  | "sri-lanka-fintech";

export type CodexRarity = "common" | "rare" | "legendary";

export interface CodexCard {
  id: string;
  title: string;
  subtitle: string;
  category: CodexCategory;
  rarity: CodexRarity;
  icon: string; // Lucide icon identifier
  summary: string;
  detail: string;
  festivalRelevance: string;
}

export const FINTECH_CODEX_CARDS: CodexCard[] = [
  {
    id: "lankaqr",
    title: "LANKAQR National Standard",
    subtitle: "Unified Interoperable Retail QR Rails",
    category: "sri-lanka-fintech",
    rarity: "rare",
    icon: "QrCode",
    summary: "The Central Bank of Sri Lanka mandate establishing one single interoperable QR code for all financial institutions and merchants.",
    detail: "Introduced by CBSL in 2020, LANKAQR eliminates merchant checkout clutter by allowing any banking or mobile wallet app to scan and settle payments directly via the LankaPay network in real time.",
    festivalRelevance: "Powering real-time festival micro-payments and booth experiences across BMICH Colombo.",
  },
  {
    id: "rtgs-settlement",
    title: "RTGS High-Value Rails",
    subtitle: "Real-Time Gross Settlement",
    category: "central-banking",
    rarity: "common",
    icon: "Landmark",
    summary: "Continuous, non-batched settlement of high-value interbank funds with finality and immediate execution.",
    detail: "Sri Lanka's RTGS system handles wholesale interbank obligations with zero credit risk between participants, settling payments transaction-by-transaction through central bank reserve accounts.",
    festivalRelevance: "Represents the foundational backbone behind domestic liquidity distribution.",
  },
  {
    id: "lankapay-justpay",
    title: "LankaPay JustPay Rails",
    subtitle: "Direct-from-Account Micro E-Payments",
    category: "sri-lanka-fintech",
    rarity: "common",
    icon: "Zap",
    summary: "Low-cost electronic funds transfer mechanism facilitating instant account-to-merchant retail transactions.",
    detail: "JustPay empowers mobile wallets and e-commerce apps to pull funds directly from any verified bank account with multi-factor authentication, keeping merchant discount rates (MDR) exceptionally low.",
    festivalRelevance: "Democratizes low-ticket digital commerce for Sri Lankan SMEs and local vendors.",
  },
  {
    id: "cbdc-sandboxes",
    title: "Central Bank Digital Currency (CBDC)",
    subtitle: "Sovereign Programmable Tokenized Currency",
    category: "central-banking",
    rarity: "legendary",
    icon: "Coins",
    summary: "A digital liability of the central bank accessible to citizens and financial institutions for instant settlement.",
    detail: "Unlike volatile private crypto, retail CBDCs represent sovereign legal tender. CBSL and global central banks explore CBDCs to improve cross-border remittance efficiency and financial inclusion in unbanked areas.",
    festivalRelevance: "Highlighted in the 2026 Future of Money symposium track.",
  },
  {
    id: "zk-kyc",
    title: "Zero-Knowledge KYC",
    subtitle: "Privacy-Preserving Proofs of Identity",
    category: "security-crypto",
    rarity: "legendary",
    icon: "ShieldCheck",
    summary: "Proving you meet age, residency, or accreditation rules without revealing your underlying personal data.",
    detail: "Zero-Knowledge SNARKs allow financial apps to verify an applicant is over 18 or holds a verified Sri Lankan national ID without having the server store or inspect the customer's raw identity documents.",
    festivalRelevance: "Critical technology for next-generation digital onboarding without honeypot leaks.",
  },
  {
    id: "iso20022",
    title: "ISO 20022 Messaging Standard",
    subtitle: "Structured Rich Financial Telemetry",
    category: "payment-rails",
    rarity: "common",
    icon: "Binary",
    summary: "The universal XML-based syntax standard replacing legacy MT Swift messages across global banking systems.",
    detail: "ISO 20022 enables rich end-to-end remittance data, structured postal addresses, invoice identifiers, and sanction screening metadata, significantly reducing false positive compliance flags.",
    festivalRelevance: "A major modernization priority for regional cross-border commerce.",
  },
  {
    id: "ceft-instant",
    title: "CEFT Instant Interbank Transfer",
    subtitle: "Common Electronic Fund Transfer Switch",
    category: "sri-lanka-fintech",
    rarity: "common",
    icon: "ArrowRightLeft",
    summary: "Sri Lanka's 24/7 instant interbank fund transfer network operating round the clock 365 days a year.",
    detail: "Operated by LankaPay, CEFT enables retail banking customers to send up to LKR 5,000,000 between accounts in under two seconds with end-to-end transaction receipts.",
    festivalRelevance: "Enables instant peer-to-peer prize payouts for FinTechverse tournament winners.",
  },
  {
    id: "automated-market-maker",
    title: "Algorithmic Market Makers (AMM)",
    subtitle: "Peer-to-Contract Liquidity Protocols",
    category: "defi-markets",
    rarity: "rare",
    icon: "LineChart",
    summary: "Replacing traditional order books with deterministic mathematical formulas like x * y = k.",
    detail: "AMMs pool tokens into autonomous smart contracts where exchange rates adjust continuously based on supply and demand ratios, allowing constant decentralized liquidity without custodial market makers.",
    festivalRelevance: "Featured in the algorithmic trading and digital assets workshop.",
  },
  {
    id: "tokenized-remittances",
    title: "Smart Remittance Corridors",
    subtitle: "Slashing Cross-Border Middleman Fees",
    category: "payment-rails",
    rarity: "rare",
    icon: "Globe",
    summary: "Disrupting traditional 6%+ remittance costs through direct on-chain liquidity routing and instant FX swaps.",
    detail: "Sri Lanka receives over $5B annually in worker remittances. Programmable corridors bypass correspondent bank chains, settling foreign exchange to local rupee bank accounts within minutes.",
    festivalRelevance: "Vital for national macroeconomic stability and expat digital remittances.",
  },
  {
    id: "regtech-sandbox",
    title: "CBSL Regulatory Sandbox",
    subtitle: "Safe Harbors for Radical Innovation",
    category: "central-banking",
    rarity: "common",
    icon: "Box",
    summary: "Controlled live environments where startups test cutting-edge financial products under CBSL regulatory oversight.",
    detail: "Regulatory sandboxes lower barriers to entry for early-stage fintechs, granting tailored regulatory exemptions to assess consumer safety, scalability, and anti-money laundering controls before commercial launch.",
    festivalRelevance: "The launching ground for festival hackathon and pitch winners.",
  },
  {
    id: "open-banking-apis",
    title: "Open Banking Frameworks",
    subtitle: "Customer Data Sovereignty via Secure APIs",
    category: "payment-rails",
    rarity: "common",
    icon: "Share2",
    summary: "Standardized API protocols requiring banks to share financial history and account initiation with licensed 3rd parties upon consumer consent.",
    detail: "Open Banking breaks data monopolies, allowing personal financial management (PFM) apps and aggregators to give consumers single-pane views of their net worth, recurring bills, and creditworthiness.",
    festivalRelevance: "Enables the unified multi-wallet architecture in the FinTechverse arena.",
  },
  {
    id: "ai-fraud-ml",
    title: "Behavioral Biometrics & AI Anti-Fraud",
    subtitle: "Sub-Second Anomaly Scoring",
    category: "security-crypto",
    rarity: "rare",
    icon: "Brain",
    summary: "Machine learning models detecting account takeovers by analyzing keystroke dynamics, swipe angles, and device telemetry.",
    detail: "Modern fraud prevention systems evaluate hundreds of non-intrusive signals before approving a card swipe or wire transfer, detecting cloned SIMs, man-in-the-browser injections, and bot attacks before money moves.",
    festivalRelevance: "Safeguards digital arena balances and competitive festival leaderboards.",
  },
  {
    id: "micro-credit-scoring",
    title: "Alternative Credit Scoring",
    subtitle: "Collateral-Free Underwriting for the Unbanked",
    category: "defi-markets",
    rarity: "rare",
    icon: "Smartphone",
    summary: "Assessing creditworthiness using utility bill payments, telco airtime top-ups, and transaction flow rather than physical collateral.",
    detail: "By analyzing cash-flow consistency from e-wallets and invoice data, microfinance algorithms empower micro-entrepreneurs and tuk-tuk operators to secure working capital in seconds.",
    festivalRelevance: "Championing financial inclusion across Sri Lanka's rural digital economy.",
  },
  {
    id: "hardware-security-modules",
    title: "Hardware Security Modules (HSM)",
    subtitle: "Tamper-Proof Silicon Cryptography",
    category: "security-crypto",
    rarity: "rare",
    icon: "Lock",
    summary: "Dedicated physical cryptographic processors storing master private keys, PIN blocks, and transaction signing keys.",
    detail: "HSMs are certified under FIPS 140-2 Level 3/4 standards. Any physical breach attempt causes the silicon chip to zeroize stored cryptographic keys in microseconds, protecting national payment switches from physical theft.",
    festivalRelevance: "Guarantees cryptographic integrity for financial transactions across all banking nodes.",
  },
  {
    id: "embedded-finance",
    title: "Embedded Finance & BaaS",
    subtitle: "Banking-as-a-Service Inside Everyday Apps",
    category: "payment-rails",
    rarity: "common",
    icon: "Layers",
    summary: "Integrating financial accounts, insurance, and lending seamlessly into non-financial applications like ride-hailing and retail platforms.",
    detail: "Instead of directing users to a bank branch or separate app, embedded finance delivers contextual loans at point-of-sale or automatic freight insurance during shipment booking.",
    festivalRelevance: "The architectural model behind integrating games with real financial education.",
  },
  {
    id: "defi-yield-oracles",
    title: "Decentralized Price Oracles",
    subtitle: "Bridging Real-World Market Feeds On-Chain",
    category: "defi-markets",
    rarity: "rare",
    icon: "Radio",
    summary: "Cryptographic consensus networks that inject real-time currency exchange rates and stock prices into smart contracts.",
    detail: "Decentralized oracles prevent flash loan manipulation and exploit vectors by aggregating median price data from dozens of independent institutional exchanges and cryptographic validators.",
    festivalRelevance: "Powers autonomous tournament reward pools and asset swaps.",
  },
  {
    id: "programmable-escrow",
    title: "Smart Contract Escrows",
    subtitle: "Zero-Trust Milestone Settlement",
    category: "defi-markets",
    rarity: "common",
    icon: "FileCheck",
    summary: "Self-executing escrow accounts that release payments automatically upon verifiable milestone delivery.",
    detail: "Eliminates counterparty default risk in cross-border trade, software freelance contracts, and real estate earnest deposits without expensive legal intermediaries.",
    festivalRelevance: "Used in FinTechverse challenge contracts and tournament bounty matching.",
  },
  {
    id: "biometric-pos",
    title: "Biometric POS & Pay-by-Palm",
    subtitle: "Cardless & Phoneless Physical Checkout",
    category: "sri-lanka-fintech",
    rarity: "legendary",
    icon: "Fingerprint",
    summary: "Authorizing purchases simply by presenting an infrared palm vein scan or face vector linked to your bank account.",
    detail: "Palm vein patterns are internal to the vascular system and nearly impossible to spoof or photograph. Combined with tokenized payment networks, it creates friction-free checkout in busy festival food and retail zones.",
    festivalRelevance: "Live pilot demonstrations operating at the festival tech pavilion.",
  },
  {
    id: "green-fintech",
    title: "Green FinTech & Carbon Ledgers",
    subtitle: "Tokenized Carbon Offsets & ESG Scoring",
    category: "defi-markets",
    rarity: "common",
    icon: "Leaf",
    summary: "Tracking carbon footprints directly at checkout and issuing fractional certified mangrove and solar credits.",
    detail: "Empowers Sri Lankan exporters to meet strict European ESG compliance by embedding real-time supply chain provenance and certified carbon offset retirements onto distributed ledgers.",
    festivalRelevance: "Aligns with the festival's zero-waste sustainability pledge.",
  },
  {
    id: "algorithmic-stablecoins",
    title: "Over-Collateralized Stablecoins",
    subtitle: "Decentralized Price Parity Mechanisms",
    category: "defi-markets",
    rarity: "rare",
    icon: "DollarSign",
    summary: "Crypto-collateralized tokens pegged 1:1 to fiat currencies through automated liquidation vaults.",
    detail: "Unlike centralized reserves that rely on commercial bank deposits, over-collateralized debt positions maintain purchasing power through on-chain transparency and algorithmic stability incentives.",
    festivalRelevance: "Explores financial sovereignty and censorship-resistant global trade.",
  },
  {
    id: "quantum-safe-crypto",
    title: "Post-Quantum Cryptography (PQC)",
    subtitle: "Future-Proofing Banking Encryption",
    category: "security-crypto",
    rarity: "legendary",
    icon: "Cpu",
    summary: "Lattice-based encryption algorithms immune to Shor's algorithm running on future quantum supercomputers.",
    detail: "With NIST standardizing ML-KEM and ML-DSA, global central banks and SWIFT are actively transitioning root certificates to prevent 'Harvest Now, Decrypt Later' espionage attacks.",
    festivalRelevance: "The next decade's premier cybersecurity paradigm shift for national payment systems.",
  },
  {
    id: "shared-agent-banking",
    title: "Shared Agent Banking Networks",
    subtitle: "Turning Village Corner Shops into Micro-Branches",
    category: "sri-lanka-fintech",
    rarity: "common",
    icon: "Store",
    summary: "Equipping mom-and-pop grocery stores with POS terminals to handle deposits, utility payments, and cash withdrawals.",
    detail: "Brings formal banking services to remote agricultural communities across Uva and Northern provinces, eliminating long and costly bus rides to provincial bank branches.",
    festivalRelevance: "Core social impact pillar celebrated by the CBSL financial inclusion roadmap.",
  },
  {
    id: "flash-liquidity",
    title: "Atomic Flash Swaps & Arbitrage",
    subtitle: "Sub-Block Zero-Collateral Liquidity Routing",
    category: "defi-markets",
    rarity: "rare",
    icon: "ZapFast",
    summary: "Borrowing millions in capital and repaying it within the exact same atomic transaction block.",
    detail: "If the borrowed capital is not repaid with fees by the end of the execution block, the entire transaction reverts as if it never happened, preventing lender risk while ensuring tight market pricing.",
    festivalRelevance: "Subject of the advanced algorithmic trading masterclass.",
  },
  {
    id: "digital-nomad-banking",
    title: "Cross-Border Nomad Neobanks",
    subtitle: "Multi-Currency Virtual IBANs for Remote Workers",
    category: "payment-rails",
    rarity: "common",
    icon: "Compass",
    summary: "Instant multi-currency accounts allowing Sri Lankan software engineers and digital nomads to hold and receive USD, GBP, and EUR.",
    detail: "Enables direct bank wire receipts from Silicon Valley and European clients with competitive FX spreads and local tax compliance integrations.",
    festivalRelevance: "Accelerates Sri Lanka's booming $3B knowledge-services export sector.",
  },
];

/**
 * Returns cards that match unlocked IDs.
 */
export function getUnlockedCodexCards(unlockedIds: string[]): CodexCard[] {
  const set = new Set(unlockedIds || []);
  return FINTECH_CODEX_CARDS.filter((c) => set.has(c.id));
}

/**
 * Returns an uncollected card at random, or null if all collected.
 */
export function unlockRandomCodexCard(currentlyUnlocked: string[]): CodexCard | null {
  const unlockedSet = new Set(currentlyUnlocked || []);
  const remaining = FINTECH_CODEX_CARDS.filter((c) => !unlockedSet.has(c.id));
  if (remaining.length === 0) return null;
  const picked = remaining[Math.floor(Math.random() * remaining.length)];
  return picked;
}
