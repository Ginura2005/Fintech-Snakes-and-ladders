/**
 * Pinpoint Knowledge Engine
 *
 * Expands category packs to 25+ curated FinTech & Tech sets with:
 *   - Clue progressive reveals
 *   - Flexible fuzzy answer validation
 *   - Helpful hints (first letter, letter count)
 *   - Educational post-win takeaways
 */

import { mulberry32, getDailyPuzzleSeed } from "./prng";

export interface PinpointExpandedPack {
  id: number;
  topic: string;
  category: string;
  acceptedAnswers: string[];
  clues: string[]; // 5 clues, broad to specific
  explanation: string;
  educationalFact: string;
}

export const PINPOINT_KNOWLEDGE_BASE: PinpointExpandedPack[] = [
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
    educationalFact:
      "LANKAQR is Sri Lanka's national quick response standard, enabling interoperable, cost-effective digital payments across all participating financial institutions.",
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
      "billion dollar fintechs",
    ],
    clues: [
      "Klarna (Buy Now Pay Later pioneer)",
      "Revolut (Digital Neo-Banking)",
      "Stripe (Global Developer Payments)",
      "Nubank (Latin America's Mega Digital Bank)",
      "Checkout.com (Cloud Payment Processing)",
    ],
    explanation:
      "Each of these companies achieved multi-billion dollar valuation by transforming traditional banking into cloud-native digital experiences.",
    educationalFact:
      "Nubank grew from a simple fee-free credit card in Brazil to one of the largest digital banking platforms in the world with over 90 million customers.",
  },
  {
    id: 3,
    topic: "Blockchain Consensus",
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
      "Proof of Authority (Enterprise Private Ledgers)",
    ],
    explanation:
      "Decentralized protocols that network nodes use to agree on the valid, tamper-evident state of a distributed ledger.",
    educationalFact:
      "Ethereum's transition from Proof of Work to Proof of Stake in 'The Merge' reduced its energy consumption by over 99.95%.",
  },
  {
    id: 4,
    topic: "Sri Lankan Banking Pillars",
    category: "Commercial Banks in Sri Lanka",
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
      "Bank of Ceylon (State Banking Pioneer)",
      "Commercial Bank of Ceylon (COMBANK)",
      "Hatton National Bank (HNB)",
      "Sampath Bank (Digital Banking Trailblazer)",
      "Nations Trust Bank (FriMi Creator)",
    ],
    explanation:
      "Leading Licensed Commercial Banks driving financial inclusion, retail banking, and digital payments across Sri Lanka.",
    educationalFact:
      "Bank of Ceylon and Commercial Bank are the largest state and private commercial banks in Sri Lanka, together serving millions of accounts nationwide.",
  },
  {
    id: 5,
    topic: "Distributed Block Anatomy",
    category: "Components of a Blockchain Block",
    acceptedAnswers: [
      "components of a block",
      "blockchain block header",
      "parts of a block",
      "block components",
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
      "Cryptographic primitives and metadata fields that compose verified blocks on a distributed blockchain ledger.",
    educationalFact:
      "A Merkle tree allows efficient and secure verification of large data structures by hashing pairs of nodes recursively up to a single top root hash.",
  },
  {
    id: 6,
    topic: "Cross-Border Settlement",
    category: "Cross-Border Payment Protocols",
    acceptedAnswers: [
      "cross border payments",
      "international payments",
      "remittance systems",
      "payment rails",
      "interbank payment systems",
      "financial messaging",
    ],
    clues: [
      "SWIFT Network (BIC & IBAN Messaging)",
      "SEPA (Single Euro Payments Area)",
      "FedNow (US Instant Settlement)",
      "RTGS (Real-Time Gross Settlement)",
      "Ripple Interledger Protocol (ILP)",
    ],
    explanation:
      "Global interbank rails and messaging standards used to move trillions in international liquidity daily.",
    educationalFact:
      "ISO 20022 is the universal messaging standard modernizing SWIFT and RTGS systems worldwide with rich structured financial data.",
  },
  {
    id: 7,
    topic: "Central Banking Primitives",
    category: "Monetary Policy Instruments",
    acceptedAnswers: [
      "monetary policy",
      "monetary policy instruments",
      "central bank tools",
      "interest rates",
      "central banking",
    ],
    clues: [
      "Standing Deposit Facility Rate (SDFR)",
      "Standing Lending Facility Rate (SLFR)",
      "Statutory Reserve Ratio (SRR)",
      "Open Market Operations (Treasury Bill Auctions)",
      "Foreign Exchange Reserve Interventions",
    ],
    explanation:
      "Key macro-financial tools utilized by the Central Bank of Sri Lanka (CBSL) to regulate inflation and money supply.",
    educationalFact:
      "The Central Bank of Sri Lanka was established under the Monetary Law Act No. 58 of 1949 and began operations on August 28, 1950.",
  },
  {
    id: 8,
    topic: "Financial Cyber Defense",
    category: "Cybersecurity Controls",
    acceptedAnswers: [
      "cybersecurity controls",
      "cyber security",
      "security controls",
      "banking security",
      "authentication methods",
      "security measures",
    ],
    clues: [
      "Two-Factor Authentication (2FA SMS & TOTP)",
      "Hardware Security Modules (HSM)",
      "End-to-End Encryption (AES-256 & TLS 1.3)",
      "Biometric Passkey (Fingerprint & FaceID)",
      "Zero Trust Architecture",
    ],
    explanation:
      "Essential digital defense safeguards implemented across online banking, POS terminals, and cloud payment gateways.",
    educationalFact:
      "Hardware Security Modules (HSMs) are tamper-resistant physical computing devices used by card networks to securely manage cryptographic keys and verify PINs.",
  },
  {
    id: 9,
    topic: "Digital Wallets in Sri Lanka",
    category: "Sri Lankan FinTech Apps",
    acceptedAnswers: [
      "sri lankan fintech apps",
      "digital wallets",
      "sri lankan wallets",
      "mobile wallets",
      "digital banking apps",
      "wallets in sri lanka",
    ],
    clues: [
      "FriMi (Nations Trust Bank)",
      "Flash (Commercial Bank)",
      "eZ Cash (Dialog Axiata)",
      "mCash (SLT-Mobitel)",
      "Q+ Payment App (Commercial Bank)",
    ],
    explanation:
      "Pioneering digital wallets and smart banking lifestyle apps launched in Sri Lanka licensed under Central Bank regulations.",
    educationalFact:
      "FriMi launched in 2017 as Sri Lanka's first digital banking experience offering seamless contactless payments, onboarding, and virtual debit cards.",
  },
  {
    id: 10,
    topic: "Global Payment Messaging",
    category: "Financial Messaging Protocols",
    acceptedAnswers: [
      "financial messaging protocols",
      "payment messaging",
      "financial messages",
      "swift messages",
      "messaging standards",
      "iso 20022",
    ],
    clues: [
      "SWIFT MT103 (Single Customer Credit Transfer)",
      "ISO 20022 XML (pacs.008 & camt.053)",
      "FIX Protocol (Financial Information eXchange)",
      "ACH NACHA File Format",
      "SEPA Credit Transfer (SCT)",
    ],
    explanation:
      "Standardized data protocols used between global financial institutions to orchestrate cross-border transfers and settlements.",
    educationalFact:
      "ISO 20022 replaces unstructured legacy SWIFT MT messages with rich XML-based schemas, preventing AML false positives and speeding up automated settlement.",
  },
  {
    id: 11,
    topic: "Colombo Stock Exchange",
    category: "Capital Market Terms",
    acceptedAnswers: [
      "capital market terms",
      "colombo stock exchange",
      "stock market terms",
      "cse",
      "stock trading",
      "equities",
    ],
    clues: [
      "All Share Price Index (ASPI)",
      "S&P Sri Lanka 20 (S&P SL20)",
      "Central Depository System (CDS)",
      "Initial Public Offering (IPO)",
      "Market Capitalization",
    ],
    explanation:
      "Foundational indices, custody bodies, and market metrics governing equities traded on the Colombo Stock Exchange (CSE).",
    educationalFact:
      "The All Share Price Index (ASPI) tracks the price movements of all ordinary shares listed on the Colombo Stock Exchange in Sri Lanka.",
  },
  {
    id: 12,
    topic: "Trade Finance Instruments",
    category: "Trade Finance",
    acceptedAnswers: [
      "trade finance",
      "trade finance instruments",
      "international trade instruments",
      "trade documents",
      "letters of credit",
    ],
    clues: [
      "Letter of Credit (LC)",
      "Bill of Lading (B/L)",
      "Bank Guarantee (BG)",
      "Documentary Collection (DP / DA)",
      "Standby Letter of Credit (SBLC)",
    ],
    explanation:
      "Financial and legal instruments used by importers and exporters to mitigate counterparty risk during cross-border commerce.",
    educationalFact:
      "A Letter of Credit (LC) is an irrevocable undertaking issued by a bank promising the seller payment upon presentation of compliant shipping documents.",
  },
  {
    id: 13,
    topic: "Credit Rating Agencies",
    category: "Credit Rating Agencies",
    acceptedAnswers: [
      "credit rating agencies",
      "rating agencies",
      "ratings agencies",
      "credit agencies",
      "credit bureaus",
    ],
    clues: [
      "Fitch Ratings",
      "Moody's Investors Service",
      "S&P Global Ratings",
      "CRIB (Credit Information Bureau of Sri Lanka)",
      "Lanka Rating Agency (LRA)",
    ],
    explanation:
      "Institutions evaluating creditworthiness, default risk of sovereign states, corporate debt securities, and retail borrowers.",
    educationalFact:
      "CRIB (Credit Information Bureau of Sri Lanka) was South Asia's first credit bureau, established by Parliamentary Act in 1990.",
  },
  {
    id: 14,
    topic: "Core Banking Platforms",
    category: "Core Banking Systems",
    acceptedAnswers: [
      "core banking systems",
      "core banking platforms",
      "banking software",
      "core banking",
      "banking platforms",
    ],
    clues: [
      "Infosys Finacle",
      "Temenos Transact (T24)",
      "Oracle FLEXCUBE",
      "TCS BaNCS",
      "Mambu Cloud Banking",
    ],
    explanation:
      "Mission-critical backend software suites managing deposits, loans, ledgers, and transaction processing for retail and commercial banks.",
    educationalFact:
      "Over 60% of commercial banks in Sri Lanka run either Infosys Finacle or Oracle FLEXCUBE for their high-throughput transaction engines.",
  },
  {
    id: 15,
    topic: "Merchant Acquiring & POS",
    category: "Merchant Payment Terminals",
    acceptedAnswers: [
      "merchant payment terminals",
      "pos terminals",
      "point of sale",
      "merchant acquiring",
      "pos systems",
      "card terminals",
    ],
    clues: [
      "Electronic Data Capture (EDC Machine)",
      "SoftPOS (Smartphone Tap-to-Phone)",
      "NFC Contactless Antenna",
      "EMV Chip & PIN Reader",
      "Merchant Acquiring Gateway",
    ],
    explanation:
      "Hardware and software endpoints deployed at physical retail checkouts to securely ingest consumer credit, debit, and QR payments.",
    educationalFact:
      "SoftPOS enables micro-merchants in emerging markets to accept contactless card payments directly on NFC-enabled Android phones without dedicated hardware.",
  },
  {
    id: 16,
    topic: "Open Banking & API Economy",
    category: "Open Banking Standards",
    acceptedAnswers: [
      "open banking standards",
      "open banking",
      "banking apis",
      "open banking apis",
      "api banking",
    ],
    clues: [
      "PSD2 Open Banking Directive",
      "Account Information Service Provider (AISP)",
      "Payment Initiation Service Provider (PISP)",
      "OAuth 2.0 & OpenID Connect Token Auth",
      "Open API Regulatory Sandbox",
    ],
    explanation:
      "Regulatory frameworks and technological rails empowering third-party FinTechs to securely access banking data with user consent.",
    educationalFact:
      "Under Open Banking, banks expose standardized REST APIs allowing personal budgeting apps to pull balances directly, eliminating fragile web scraping.",
  },
  {
    id: 17,
    topic: "Central Bank Monetary Policy",
    category: "Monetary Policy Instruments",
    acceptedAnswers: [
      "monetary policy instruments",
      "central bank instruments",
      "monetary policy",
      "cbsl instruments",
      "interest rate tools",
    ],
    clues: [
      "Standing Deposit Facility Rate (SDFR)",
      "Standing Lending Facility Rate (SLFR)",
      "Statutory Reserve Ratio (SRR)",
      "Open Market Operations (OMO)",
      "Treasury Bill Reverse Repo Auctions",
    ],
    explanation:
      "Key macro-financial levers deployed by the Central Bank of Sri Lanka (CBSL) to regulate money supply and stabilize inflation.",
    educationalFact:
      "CBSL conducts daily Open Market Operations to inject or mop up excess liquidity within the domestic interbank call money market.",
  },
  {
    id: 18,
    topic: "Algorithmic Trading Strategies",
    category: "Algorithmic Trading",
    acceptedAnswers: [
      "algorithmic trading",
      "algo trading",
      "automated trading",
      "trading algorithms",
      "quantitative trading",
    ],
    clues: [
      "Volume-Weighted Average Price (VWAP)",
      "Time-Weighted Average Price (TWAP)",
      "Statistical Arbitrage",
      "Limit Order Book Market Making",
      "High-Frequency Latency Arbitrage (HFT)",
    ],
    explanation:
      "Programmatic trading execution paradigms designed to minimize market impact or capitalize on microsecond price discrepancies.",
    educationalFact:
      "VWAP execution benchmarks partition large institutional orders throughout the trading day to ensure average price matches the market weighted curve.",
  },
  {
    id: 19,
    topic: "Fraud Detection & Prevention",
    category: "Fraud Prevention Controls",
    acceptedAnswers: [
      "fraud prevention controls",
      "fraud detection",
      "fraud prevention",
      "anti fraud",
      "fraud controls",
      "financial fraud detection",
    ],
    clues: [
      "Transaction Velocity Checks",
      "Geo-IP & Device Fingerprinting",
      "Card Verification Value (CVV & Dynamic CVV)",
      "Machine Learning Anomaly Scoring",
      "Chargeback Prevention Alerts (Ethoca & Verifi)",
    ],
    explanation:
      "Real-time heuristic and behavioral risk-monitoring systems guarding payment networks against unauthorized account takeovers.",
    educationalFact:
      "Dynamic CVV features on digital bank cards refresh the 3-digit security code periodically via e-ink or app, rendering skimmed card data useless.",
  },
  {
    id: 20,
    topic: "Decentralized Finance Primitives",
    category: "DeFi Primitives",
    acceptedAnswers: [
      "defi primitives",
      "decentralized finance",
      "defi protocols",
      "defi",
      "web3 finance",
    ],
    clues: [
      "Automated Market Maker (AMM Constant Product Formula)",
      "Liquidity Pools & LP Tokens",
      "Over-Collateralized Lending Protocols",
      "Flash Loans (Uncollateralized Single-Block Loans)",
      "Yield Farming & Staking APR",
    ],
    explanation:
      "Smart-contract financial building blocks recreating lending, liquidity provision, and exchange without central intermediaries.",
    educationalFact:
      "Flash loans permit borrowing millions in digital assets with zero upfront collateral, provided the borrowed principal plus fee is returned in the exact same transaction block.",
  },
  {
    id: 21,
    topic: "Personal Wealth Metrics",
    category: "Personal Finance Metrics",
    acceptedAnswers: [
      "personal finance metrics",
      "personal finance",
      "financial metrics",
      "wealth metrics",
      "financial ratios",
    ],
    clues: [
      "Debt-to-Income Ratio (DTI)",
      "Emergency Fund Runaway (3-6 Months Expenses)",
      "Compound Annual Growth Rate (CAGR)",
      "Net Worth (Total Assets - Liabilities)",
      "Credit Score (FICO / CRIB Rating)",
    ],
    explanation:
      "Essential personal financial health indicators used by retail borrowers and lending institutions to gauge credit capacity.",
    educationalFact:
      "Financial advisers recommend maintaining a Debt-to-Income (DTI) ratio below 36% to ensure resilient mortgage and loan repayment capacity.",
  },
  {
    id: 22,
    topic: "Digital Identity & Trust",
    category: "Digital Identity Systems",
    acceptedAnswers: [
      "digital identity systems",
      "digital identity",
      "digital id",
      "electronic identity",
      "eid",
      "identity verification",
    ],
    clues: [
      "Self-Sovereign Identity (SSI Decentralized Identifiers)",
      "Sri Lanka Unique Digital Identity (SL-UDI)",
      "Biometric Passports (e-Passports)",
      "FIDO2 WebAuthn Passwordless Auth",
      "Verifiable Credentials (W3C standard)",
    ],
    explanation:
      "Cryptography-backed identity verification frameworks enabling seamless digital citizen onboarding and secure financial authorization.",
    educationalFact:
      "Sri Lanka's National Digital Identity framework enables paperless, instant bank account opening through authenticated government identity registers.",
  },
  {
    id: 23,
    topic: "Insurance Technology",
    category: "InsurTech Concepts",
    acceptedAnswers: [
      "insurtech concepts",
      "insurtech",
      "insurance technology",
      "insurance",
      "digital insurance",
    ],
    clues: [
      "Parametric Insurance (Trigger-based payouts)",
      "Automated Actuarial Risk Modeling",
      "Telematics Usage-Based Car Insurance",
      "Micro-Insurance for Smallholder Farmers",
      "Claims Processing OCR & Computer Vision",
    ],
    explanation:
      "Modern digital transformations streamlining underwriting, risk assessment, and claims distribution in the insurance sector.",
    educationalFact:
      "Parametric insurance pays out automatically when an objective weather parameter (such as rainfall deficit or wind speed) is verified by satellite sensors.",
  },
  {
    id: 24,
    topic: "Stablecoins & Central Bank Currencies",
    category: "Digital Currencies",
    acceptedAnswers: [
      "digital currencies",
      "stablecoins",
      "cbdc",
      "digital money",
      "virtual currencies",
      "fiat pegged tokens",
    ],
    clues: [
      "Central Bank Digital Currency (CBDC)",
      "Fiat-Backed Stablecoins (USDC & USDT)",
      "Algorithmic Stablecoins",
      "Digital Sri Lankan Rupee (e-Rupee)",
      "Tokenized Commercial Bank Deposits",
    ],
    explanation:
      "Cryptographic representations of sovereign currencies designed for 24/7 cross-border settlement and programmatic smart contracts.",
    educationalFact:
      "Unlike cryptocurrencies with volatile prices, fully reserve-backed stablecoins hold equivalent liquid cash and short-term Treasuries in custodial vaults.",
  },
  {
    id: 25,
    topic: "Anti-Money Laundering Safeguards",
    category: "AML Compliance Tools",
    acceptedAnswers: [
      "aml compliance tools",
      "aml compliance",
      "anti money laundering",
      "aml",
      "financial crime compliance",
      "aml tools",
    ],
    clues: [
      "Politically Exposed Persons (PEP Screening)",
      "OFAC & UN Sanctions Watchlists",
      "Suspicious Transaction Report (STR / SAR)",
      "Ultimate Beneficial Ownership (UBO Registry)",
      "Transaction Monitoring Rule Engines",
    ],
    explanation:
      "Regulatory frameworks and screening technologies utilized by banks to detect and prevent terrorist financing and illicit capital flows.",
    educationalFact:
      "Banks are legally mandated to submit Suspicious Transaction Reports (STRs) to national Financial Intelligence Units (FIU) when unexplained transaction spikes occur.",
  },
  {
    id: 26,
    topic: "Microfinance & Financial Inclusion",
    category: "Financial Inclusion Tools",
    acceptedAnswers: [
      "financial inclusion tools",
      "financial inclusion",
      "microfinance",
      "inclusive finance",
      "micro lending",
    ],
    clues: [
      "Peer-to-Peer Community Lending Groups",
      "Alternative Credit Scoring (Telco data & bill payments)",
      "Agent Banking in Rural Outposts",
      "Zero-Balance Basic Savings Accounts",
      "Micro-Leasing for Agritech Equipment",
    ],
    explanation:
      "Initiatives designed to provide affordable, accessible banking and credit services to unbanked and underserved populations.",
    educationalFact:
      "By utilizing alternative data such as utility bill payments and mobile phone top-ups, FinTechs can extend fair credit to borrowers without formal credit histories.",
  },
];

/**
 * Checks if a user's guess matches the target category (fuzzy normalized).
 */
export function checkPinpointMatch(
  guess: string,
  acceptedAnswers: string[]
): boolean {
  const cleanGuess = guess
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 ]/g, "");

  return acceptedAnswers.some((accepted) => {
    const cleanAccepted = accepted
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9 ]/g, "");
    return (
      cleanGuess === cleanAccepted ||
      cleanGuess.includes(cleanAccepted) ||
      cleanAccepted.includes(cleanGuess)
    );
  });
}

export const checkPinpointGuess = checkPinpointMatch;

/**
 * Gets the daily puzzle pack based on the calendar day.
 */
export function getDailyPinpointPack(date = new Date()): PinpointExpandedPack {
  const seed = getDailyPuzzleSeed(date);
  const index = seed % PINPOINT_KNOWLEDGE_BASE.length;
  return PINPOINT_KNOWLEDGE_BASE[index];
}

/**
 * Gets a random puzzle pack based on a seed.
 */
export function getRandomPinpointPack(seed = Date.now()): PinpointExpandedPack {
  const rng = mulberry32(seed);
  const index = Math.floor(rng() * PINPOINT_KNOWLEDGE_BASE.length);
  return PINPOINT_KNOWLEDGE_BASE[index];
}

/**
 * Generates hints for a category (first letter, word count, total letters).
 */
export function getPinpointHint(category: string): {
  firstLetter: string;
  wordCount: number;
  letterCount: number;
} {
  const clean = category.trim();
  const words = clean.split(/\s+/);
  return {
    firstLetter: clean.charAt(0).toUpperCase(),
    wordCount: words.length,
    letterCount: clean.replace(/\s+/g, "").length,
  };
}

export const PINPOINT_DATABASE = PINPOINT_KNOWLEDGE_BASE;
