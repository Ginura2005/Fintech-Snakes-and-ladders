/**
 * LANKA FINTECHVERSE — FinTech Quiz Question Bank
 * 25 reviewed multiple-choice questions with balanced option lengths.
 * Distractors are structured with balanced length and complexity to ensure
 * answers cannot be guessed purely by selecting the longest option.
 */

export interface QuizQuestion {
  id: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  question: string;
  options: string[];
  correctIndex: number; // 0-based
  explanation: string;
}

export const QUIZ_BANK: QuizQuestion[] = [
  // ── Digital Payments ──────────────────────────────────────────────────────
  {
    id: "q001",
    category: "Digital Payments",
    difficulty: "easy",
    question: "What does QR stand for in QR Code payments?",
    options: ["Quick Response", "Query Request", "Quantum Read", "Queue Register"],
    correctIndex: 0,
    explanation: "QR stands for Quick Response. QR codes can be scanned quickly to complete digital payments.",
  },
  {
    id: "q002",
    category: "Digital Payments",
    difficulty: "easy",
    question: "Which of the following is an example of a contactless payment technology?",
    options: [
      "Magnetic stripe card swipe",
      "Paper cheque deposit slip",
      "NFC (Near Field Communication)",
      "Manual wire transfer order",
    ],
    correctIndex: 2,
    explanation: "NFC enables contactless payments by allowing devices to communicate when held close together.",
  },
  {
    id: "q003",
    category: "Digital Payments",
    difficulty: "medium",
    question: "What is a payment gateway?",
    options: [
      "A physical security vault installed inside a commercial bank branch",
      "Software that securely authorises and processes digital transactions",
      "A specialized plastic credit card equipped with biometric sensors",
      "A government customs portal that assesses cross-border excise duties",
    ],
    correctIndex: 1,
    explanation: "A payment gateway is technology that securely captures and transmits payment data between customers, merchants, and banks.",
  },

  // ── Cybersecurity & Phishing ───────────────────────────────────────────────
  {
    id: "q004",
    category: "Cybersecurity",
    difficulty: "easy",
    question: "What is phishing?",
    options: [
      "A regulated investment program that yields fixed quarterly dividends",
      "A fraudulent attempt to steal credentials by posing as a trusted entity",
      "An automated cryptographic algorithm that backs up financial databases",
      "A formal dispute resolution mechanism between merchant banking portals",
    ],
    correctIndex: 1,
    explanation: "Phishing tricks people into revealing passwords or financial details through fake emails, websites, or messages.",
  },
  {
    id: "q005",
    category: "Cybersecurity",
    difficulty: "medium",
    question: "Which practice best protects your online banking account?",
    options: [
      "Using the same memorable master password across all personal accounts",
      "Reading verification OTP codes to customer service reps over the phone",
      "Enabling multi-factor authentication across your devices and accounts",
      "Allowing shared internet cafe browsers to save online banking logins",
    ],
    correctIndex: 2,
    explanation: "Two-factor authentication adds a second verification step, greatly reducing the risk of unauthorised access.",
  },
  {
    id: "q006",
    category: "Cybersecurity",
    difficulty: "medium",
    question: "What should you do if you receive a suspicious email asking for your bank details?",
    options: [
      "Reply with your account number to confirm that your account is authentic",
      "Click the verification link to inspect whether the banking portal is legitimate",
      "Delete the message immediately and report the attempt to your official bank",
      "Forward the suspicious email to friends and colleagues as a helpful warning",
    ],
    correctIndex: 2,
    explanation: "Legitimate banks never ask for full account details via email. Report and delete suspicious messages.",
  },

  // ── Digital Banking ────────────────────────────────────────────────────────
  {
    id: "q007",
    category: "Digital Banking",
    difficulty: "easy",
    question: "What is mobile banking?",
    options: [
      "Financial services conducted exclusively through roadside mobile vans",
      "Banking services accessed through a dedicated smartphone application",
      "A specialized cellular SIM card designed to store physical cash balances",
      "An automated teller network operating exclusively on cellular radio towers",
    ],
    correctIndex: 1,
    explanation: "Mobile banking lets customers check balances, transfer money, and pay bills using a smartphone app.",
  },
  {
    id: "q008",
    category: "Digital Banking",
    difficulty: "medium",
    question: "What does IBAN stand for?",
    options: [
      "International Bank Account Number",
      "Interbank Authentication Network",
      "Internet Banking Application Node",
      "Integrated Banking Accounting Name",
    ],
    correctIndex: 0,
    explanation: "IBAN (International Bank Account Number) is a standardised format for uniquely identifying a bank account internationally.",
  },

  // ── Financial Literacy ────────────────────────────────────────────────────
  {
    id: "q009",
    category: "Financial Literacy",
    difficulty: "easy",
    question: "What is compound interest?",
    options: [
      "Interest calculated solely on the original principal deposit amount",
      "Interest earned on both the initial principal and accumulated interest",
      "A statutory regulatory tariff assessed annually by monetary authorities",
      "A penalty charge applied when credit card borrowing exceeds agreed limits",
    ],
    correctIndex: 1,
    explanation: "Compound interest grows your savings faster because you earn interest on previously earned interest, not just the original amount.",
  },
  {
    id: "q010",
    category: "Financial Literacy",
    difficulty: "medium",
    question: "What is an emergency fund?",
    options: [
      "Short-term consumer credit borrowed when sudden unexpected bills arise",
      "Dedicated savings set aside specifically to cover unexpected life expenses",
      "Government disaster relief compensation disbursed after severe weather",
      "An insurance endowment policy that reimburses speculative market losses",
    ],
    correctIndex: 1,
    explanation: "An emergency fund is personal savings (typically 3–6 months of expenses) reserved for unexpected situations.",
  },
  {
    id: "q011",
    category: "Financial Literacy",
    difficulty: "medium",
    question: "What does diversification mean in personal finance?",
    options: [
      "Allocating all available capital into a single high-growth technology stock",
      "Spreading investments across varied asset types to reduce overall risk",
      "Converting all domestic currency reserves into speculative foreign exchange",
      "Securing commercial credit lines from multiple non-banking finance lenders",
    ],
    correctIndex: 1,
    explanation: "Diversification reduces risk by not concentrating all funds in one place — if one investment performs poorly, others may perform better.",
  },

  // ── Fraud Prevention ───────────────────────────────────────────────────────
  {
    id: "q012",
    category: "Fraud Prevention",
    difficulty: "easy",
    question: "Which of the following is a warning sign of a financial scam?",
    options: [
      "A promise of guaranteed high returns with zero financial risk",
      "A schedule of service fees clearly disclosed prior to account opening",
      "A formal registration certificate issued by the Central Bank of Sri Lanka",
      "A requirement to complete biometric national identity card verification",
    ],
    correctIndex: 0,
    explanation: "Promises of guaranteed high returns with no risk are a classic sign of a fraudulent scheme. All genuine investments carry some risk.",
  },
  {
    id: "q013",
    category: "Fraud Prevention",
    difficulty: "medium",
    question: "What is a SIM swap attack?",
    options: [
      "Upgrading an old smartphone handset to a model with dual SIM card slots",
      "Fraud where criminals hijack your phone number to intercept security OTPs",
      "Purchasing a prepaid international roaming data eSIM prior to traveling abroad",
      "Linking a mobile telecommunications number to a digital merchant wallet app",
    ],
    correctIndex: 1,
    explanation: "In a SIM swap attack, fraudsters convince a mobile carrier to transfer your number to their SIM, allowing them to intercept OTPs.",
  },

  // ── Financial Inclusion ────────────────────────────────────────────────────
  {
    id: "q014",
    category: "Financial Inclusion",
    difficulty: "easy",
    question: "What does financial inclusion mean?",
    options: [
      "Restricting premier wealth management products to high-net-worth investors",
      "Ensuring all citizens have access to affordable, useful financial services",
      "Mandating compulsory corporate accounting curriculum across secondary schools",
      "Reducing the number of physical bank branches operating across rural districts",
    ],
    correctIndex: 1,
    explanation: "Financial inclusion aims to make banking, credit, insurance, and payments accessible to everyone, including underserved communities.",
  },
  {
    id: "q015",
    category: "Financial Inclusion",
    difficulty: "medium",
    question: "How does mobile money help financially excluded communities?",
    options: [
      "It replaces regular employment income with automatic state welfare payments",
      "It enables unbanked individuals to store, send, and receive funds via phones",
      "It grants immediate unsecured home loans without verifying repayment capacity",
      "It eliminates the statutory requirement for any anti-money-laundering checks",
    ],
    correctIndex: 1,
    explanation: "Mobile money platforms allow people in remote areas or without traditional banking access to participate in the financial system via a basic mobile phone.",
  },

  // ── Responsible Use of FinTech ─────────────────────────────────────────────
  {
    id: "q016",
    category: "Responsible FinTech",
    difficulty: "medium",
    question: "What should you always do before sharing financial data with a FinTech app?",
    options: [
      "Verify that the application has the highest download count on the app store",
      "Check that the provider is licensed by the relevant financial regulator",
      "Confirm that celebrity ambassadors endorse the product on social media channels",
      "Ensure the platform offers generous initial referral bonuses upon registration",
    ],
    correctIndex: 1,
    explanation: "Always verify that a FinTech application is licensed by the relevant authority before sharing sensitive financial information.",
  },
  {
    id: "q017",
    category: "Responsible FinTech",
    difficulty: "easy",
    question: "What does 'buy now, pay later' (BNPL) require you to plan for?",
    options: [
      "A mandatory non-refundable account opening levy due immediately",
      "Scheduled future instalment payments from your available funds",
      "Zero future liabilities because the merchant waives all outstanding debt",
      "A permanent fixed deposit balance pledged to the central banking authority",
    ],
    correctIndex: 1,
    explanation: "BNPL defers payment but you are still obligated to repay — failing to plan for repayments can result in fees or debt.",
  },

  // ── Innovation & Entrepreneurship ─────────────────────────────────────────
  {
    id: "q018",
    category: "Innovation",
    difficulty: "medium",
    question: "What is a FinTech startup?",
    options: [
      "A state agency responsible for managing national foreign exchange reserves",
      "A modern enterprise using technology to deliver financial services efficiently",
      "A traditional licensed commercial bank establishing new regional branches",
      "A government currency printing facility that issues national banknotes",
    ],
    correctIndex: 1,
    explanation: "FinTech startups innovate by using technology to improve, complement, or compete with traditional financial services.",
  },
  {
    id: "q019",
    category: "Innovation",
    difficulty: "hard",
    question: "What is an API in the context of open banking?",
    options: [
      "An automated clearing protocol that prints paper draft statements for clients",
      "An interface that lets authorised third-party apps access banking data securely",
      "An annual investment benchmark that tracks currency inflation across markets",
      "An asset protection insurance agreement that guarantees interbank deposits",
    ],
    correctIndex: 1,
    explanation: "In open banking, APIs let authorised third-party applications securely access financial data from banks, enabling new products and services.",
  },

  // ── Sri Lanka Digital Economy ──────────────────────────────────────────────
  {
    id: "q020",
    category: "Sri Lanka Digital Economy",
    difficulty: "medium",
    question: "Which regulatory body oversees payment systems in Sri Lanka?",
    options: [
      "Ministry of Finance and Planning",
      "Central Bank of Sri Lanka (CBSL)",
      "Sri Lanka Customs Department",
      "Securities and Exchange Commission",
    ],
    correctIndex: 1,
    explanation: "The Central Bank of Sri Lanka (CBSL) is responsible for regulating and supervising payment and settlement systems in the country.",
  },
  {
    id: "q021",
    category: "Sri Lanka Digital Economy",
    difficulty: "medium",
    question: "What is LankaPay?",
    options: [
      "A private cellular mobile device brand manufactured in South Asia",
      "Sri Lanka's national payment network facilitating interbank transactions",
      "A sovereign retirement pension scheme reserved for government employees",
      "An overseas international remittance courier operating across Europe",
    ],
    correctIndex: 1,
    explanation: "LankaPay is Sri Lanka's national payment network, enabling interbank transfers, card payments, and digital financial transactions.",
  },
  {
    id: "q022",
    category: "Sri Lanka Digital Economy",
    difficulty: "easy",
    question: "What does the CEFT (Common Electronic Fund Transfer) switch in Sri Lanka enable?",
    options: [
      "Cross-border sovereign currency bond settlements between global treasuries",
      "Real-time interbank electronic fund transfers between participating banks",
      "Physical bullion and precious commodity clearing across sea port terminals",
      "Corporate equity underwriting for initial public listings on the stock bourse",
    ],
    correctIndex: 1,
    explanation: "The CEFT system allows customers of different banks to transfer funds electronically in real-time within Sri Lanka.",
  },

  // ── Blockchain & Emerging Tech ─────────────────────────────────────────────
  {
    id: "q023",
    category: "Innovation",
    difficulty: "hard",
    question: "What is a key characteristic of blockchain technology?",
    options: [
      "Transaction records are centrally edited and approved by a single administrator",
      "Cryptographic distributed ledgers make confirmed transaction history tamper-resistant",
      "Database entries are cleared exclusively through mainframe computers at bank vaults",
      "Transaction records can be expunged or revised at will by system architects",
    ],
    correctIndex: 1,
    explanation: "A blockchain is a distributed ledger where records are linked cryptographically, making historical data extremely difficult to tamper with.",
  },

  // ── Insurance Tech ────────────────────────────────────────────────────────
  {
    id: "q024",
    category: "Financial Literacy",
    difficulty: "medium",
    question: "What is micro-insurance?",
    options: [
      "Comprehensive liability indemnity designed exclusively for corporate headquarters",
      "Low-premium, modest-coverage protection tailored for low-income households",
      "Compulsory multi-peril transit policies covering international maritime vessels",
      "Extended warranty coverage applicable solely to personal mobile phone repairs",
    ],
    correctIndex: 1,
    explanation: "Micro-insurance provides affordable, small-scale coverage to low-income individuals who cannot access traditional insurance products.",
  },

  // ── Data Privacy ───────────────────────────────────────────────────────────
  {
    id: "q025",
    category: "Cybersecurity",
    difficulty: "medium",
    question: "What is the primary objective of data privacy regulations like Sri Lanka's PDPA?",
    options: [
      "To require all financial websites to host their physical servers in capital cities",
      "To protect citizens' personal information and govern how institutions use data",
      "To mandate that commercial banking software be made completely open-source",
      "To standardize interchange settlement fees across commercial credit card issuers",
    ],
    correctIndex: 1,
    explanation: "Data privacy laws (such as Sri Lanka's Personal Data Protection Act No. 9 of 2022) regulate the collection, processing, and storage of personal data while granting rights to data subjects.",
  },
];

/** Get a random selection of questions for the quiz (shuffled) */
export function getQuizQuestion(questionId?: string): QuizQuestion | undefined {
  if (questionId) {
    return QUIZ_BANK.find((q) => q.id === questionId);
  }
  return undefined;
}

/** Get a random question from the bank */
export function getRandomQuestion(excludeIds: string[] = []): QuizQuestion | undefined {
  const available = QUIZ_BANK.filter((q) => !excludeIds.includes(q.id));
  if (available.length === 0) return undefined;
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return available[array[0] % available.length];
}

/** Shuffle answer options while tracking correct answer */
export function shuffleOptions(question: QuizQuestion): {
  options: string[];
  correctIndex: number;
} {
  const indexed = question.options.map((opt, i) => ({ opt, isCorrect: i === question.correctIndex }));
  // Fisher-Yates shuffle
  for (let i = indexed.length - 1; i > 0; i--) {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    const j = array[0] % (i + 1);
    [indexed[i], indexed[j]] = [indexed[j], indexed[i]];
  }
  const correctIndex = indexed.findIndex((x) => x.isCorrect);
  return {
    options: indexed.map((x) => x.opt),
    correctIndex,
  };
}
