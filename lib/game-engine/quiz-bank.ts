/**
 * LANKA FINTECHVERSE — FinTech Quiz Question Bank
 * 25 reviewed multiple-choice questions.
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
    options: ["Cash", "Cheque", "NFC (Near Field Communication)", "Wire transfer"],
    correctIndex: 2,
    explanation: "NFC enables contactless payments by allowing devices to communicate when held close together.",
  },
  {
    id: "q003",
    category: "Digital Payments",
    difficulty: "medium",
    question: "What is a payment gateway?",
    options: [
      "A physical bank branch",
      "Software that authorises and processes digital transactions",
      "A type of credit card",
      "A government payment system",
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
      "A type of digital investment",
      "A fraudulent attempt to steal sensitive information by disguising as a trustworthy entity",
      "A method of encrypted communication",
      "A form of online banking",
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
      "Using the same password for all accounts",
      "Sharing your OTP with customer service over the phone",
      "Enabling two-factor authentication",
      "Saving passwords in a browser on a shared computer",
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
      "Reply with your account number to verify identity",
      "Click the link to check if it is real",
      "Delete the email and report it to your bank",
      "Forward it to friends as a warning",
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
      "Banking done at ATMs only",
      "Banking services accessed through a smartphone application",
      "Carrying cash on a mobile phone",
      "A bank that moves from location to location",
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
      "Integrated Banking and Accounting Number",
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
      "Interest paid only on the original principal",
      "Interest earned on both the principal and accumulated interest",
      "A fixed government interest rate",
      "Interest charged on credit cards only",
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
      "Money borrowed for unexpected expenses",
      "Savings set aside specifically for unexpected expenses",
      "Government disaster relief payments",
      "Insurance that covers all financial losses",
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
      "Putting all savings into one high-return investment",
      "Spreading savings across different types of investments to reduce risk",
      "Converting all funds to foreign currency",
      "Borrowing money from multiple lenders",
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
      "A guaranteed high return with no risk",
      "A service fee clearly disclosed upfront",
      "A regulated financial institution",
      "An offer reviewed by a financial regulator",
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
      "Exchanging mobile phones with a friend",
      "A fraud where criminals take control of your phone number to intercept SMS codes",
      "Installing a new SIM card for international travel",
      "A type of mobile payment",
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
      "Providing financial services only to wealthy individuals",
      "Ensuring all people have access to useful and affordable financial services",
      "Including financial education in school exams",
      "Reducing the number of banks in a country",
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
      "It replaces the need to earn income",
      "It allows people without bank accounts to send, receive, and store money via mobile phones",
      "It gives free loans to everyone",
      "It eliminates the need for any form of identity verification",
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
      "Check if the app has the most downloads",
      "Verify the app is licensed by the relevant financial regulator",
      "Ask friends if they use it",
      "Check if it offers cashback rewards",
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
      "Nothing — it is always free",
      "Future repayments that you must have funds to cover",
      "A one-time registration fee",
      "A minimum bank balance of a specific amount",
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
      "A government financial agency",
      "A new company that uses technology to deliver financial services more efficiently",
      "A traditional bank opening a new branch",
      "A company that prints money",
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
      "Annual Payment Index",
      "Automated Payment Instruction",
      "Application Programming Interface — a set of protocols allowing different software systems to communicate",
      "Asset Protection Insurance",
    ],
    correctIndex: 2,
    explanation: "In open banking, APIs let authorised third-party applications securely access financial data from banks, enabling new products and services.",
  },

  // ── Sri Lanka Digital Economy ──────────────────────────────────────────────
  {
    id: "q020",
    category: "Sri Lanka Digital Economy",
    difficulty: "medium",
    question: "Which regulatory body oversees payment systems in Sri Lanka?",
    options: [
      "Ministry of Finance",
      "Central Bank of Sri Lanka (CBSL)",
      "Sri Lanka Customs",
      "Securities and Exchange Commission of Sri Lanka",
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
      "A mobile phone brand",
      "Sri Lanka's national payment network facilitating interbank transactions",
      "A government savings scheme",
      "An international money transfer company",
    ],
    correctIndex: 1,
    explanation: "LankaPay is Sri Lanka's national payment network, enabling interbank transfers, card payments, and digital financial transactions.",
  },
  {
    id: "q022",
    category: "Sri Lanka Digital Economy",
    difficulty: "easy",
    question: "What does the CITS (Common Electronic Fund Transfer Switch) system in Sri Lanka enable?",
    options: [
      "International remittances only",
      "Interbank electronic fund transfers between participating banks",
      "Foreign currency conversion",
      "Stock market transactions",
    ],
    correctIndex: 1,
    explanation: "The CITS allows customers of different banks to transfer funds electronically to each other within Sri Lanka.",
  },

  // ── Blockchain & Emerging Tech ─────────────────────────────────────────────
  {
    id: "q023",
    category: "Innovation",
    difficulty: "hard",
    question: "What is a key characteristic of blockchain technology?",
    options: [
      "It is controlled by a single central authority",
      "Records can be easily modified after they are added",
      "It uses a distributed ledger that is very difficult to alter once records are added",
      "It only works for cryptocurrency",
    ],
    correctIndex: 2,
    explanation: "A blockchain is a distributed ledger where records are linked cryptographically, making historical data extremely difficult to tamper with.",
  },

  // ── Insurance Tech ────────────────────────────────────────────────────────
  {
    id: "q024",
    category: "Financial Literacy",
    difficulty: "medium",
    question: "What is micro-insurance?",
    options: [
      "Insurance with very high premiums",
      "Insurance with tiny coverage amounts, designed for low-income individuals",
      "Travel insurance for short trips",
      "Insurance only for mobile devices",
    ],
    correctIndex: 1,
    explanation: "Micro-insurance provides affordable, small-scale coverage to low-income individuals who cannot access traditional insurance products.",
  },

  // ── Data Privacy ───────────────────────────────────────────────────────────
  {
    id: "q025",
    category: "Cybersecurity",
    difficulty: "medium",
    question: "What does GDPR stand for and why is it important to FinTech?",
    options: [
      "General Data Processing Regulation — it sets rules on how computers process data",
      "Global Digital Payment Rules — it standardises international payments",
      "General Data Protection Regulation — it sets rules on how personal data must be collected, stored, and used",
      "Guaranteed Deposit Protection Reserve — it protects bank deposits",
    ],
    correctIndex: 2,
    explanation: "GDPR is a European regulation giving individuals rights over their personal data. FinTechs operating in or serving EU citizens must comply, and it sets a global standard for data protection.",
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
