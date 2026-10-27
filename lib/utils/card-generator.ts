import QRCode from "qrcode";

export interface CardRenderOptions {
  format: "post" | "story"; // post: 1080x1350, story: 1080x1920
  displayName: string;
  finalScore: number;
  rank: number | null;
  outcome: "player_won" | "computer_won" | "player_eliminated";
  heartsRemaining: number;
  quizCorrect: number;
  treasuresCollected: number;
  challengeUrl: string;
  festivalDates: string;
}

export async function generateResultCardBlob(
  options: CardRenderOptions
): Promise<Blob> {
  const width = 1080;
  const height = options.format === "post" ? 1350 : 1920;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not create canvas 2d context");

  // Generate QR Code data URL with festival brand colors
  const qrDataUrl = await QRCode.toDataURL(options.challengeUrl, {
    width: 240,
    margin: 1,
    color: {
      dark: "#06061F",
      light: "#FFFFFF",
    },
  });

  const [qrImage, festivalLogo] = await Promise.all([
    loadImage(qrDataUrl),
    loadImage("/long-logo-removebg-preview.png").catch(() => null),
  ]);

  // 1. Deep Cosmic Festival Backdrop
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, "#050518");
  bgGrad.addColorStop(0.28, "#09092c");
  bgGrad.addColorStop(0.65, "#0b2628");
  bgGrad.addColorStop(1, "#040415");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Subtle Geometric Grid & Tech Accent Lines
  ctx.save();
  ctx.strokeStyle = "rgba(254, 192, 31, 0.08)";
  ctx.lineWidth = 1;
  const gridSize = 60;
  for (let x = gridSize; x < width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = gridSize; y < height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Concentric radar rings (inspired by fintechfestival.lk cyber security & DPI motifs)
  ctx.strokeStyle = "rgba(28, 160, 133, 0.14)";
  ctx.lineWidth = 1.5;
  for (let r = 80; r <= 360; r += 70) {
    ctx.beginPath();
    ctx.arc(width * 0.88, height * 0.12, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  for (let r = 70; r <= 320; r += 60) {
    ctx.beginPath();
    ctx.arc(width * 0.1, height * 0.88, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();

  // Outer Luxury Border with Target Reticles
  ctx.save();
  ctx.strokeStyle = "rgba(254, 192, 31, 0.35)";
  ctx.lineWidth = 2;
  drawRoundedRect(ctx, 36, 36, width - 72, height - 72, 28);
  ctx.stroke();

  // Corner Bracket Accents
  const cornerLen = 32;
  ctx.strokeStyle = "#FEC01F";
  ctx.lineWidth = 4;
  // Top-left
  ctx.beginPath();
  ctx.moveTo(36, 36 + cornerLen);
  ctx.lineTo(36, 36);
  ctx.lineTo(36 + cornerLen, 36);
  ctx.stroke();
  // Top-right
  ctx.beginPath();
  ctx.moveTo(width - 36 - cornerLen, 36);
  ctx.lineTo(width - 36, 36);
  ctx.lineTo(width - 36, 36 + cornerLen);
  ctx.stroke();
  // Bottom-left
  ctx.beginPath();
  ctx.moveTo(36, height - 36 - cornerLen);
  ctx.lineTo(36, height - 36);
  ctx.lineTo(36 + cornerLen, height - 36);
  ctx.stroke();
  // Bottom-right
  ctx.beginPath();
  ctx.moveTo(width - 36 - cornerLen, height - 36);
  ctx.lineTo(width - 36, height - 36);
  ctx.lineTo(width - 36, height - 36 - cornerLen);
  ctx.stroke();
  ctx.restore();

  // Vertical layout adjustments
  const yStart = options.format === "story" ? 140 : 68;

  // 2. Official Presenters & Festival Banner
  ctx.save();
  ctx.textAlign = "center";
  ctx.font = "bold 15px system-ui, -apple-system, sans-serif";
  ctx.fillStyle = "#FEC01F";
  ctx.letterSpacing = "2px";
  ctx.fillText("FINTECH FORUM SRI LANKA  ×  MINISTRY OF DIGITAL ECONOMY", width / 2, yStart + 22);

  // Logo or Festival Title
  if (festivalLogo) {
    const logoW = 340;
    const logoH = 68;
    ctx.drawImage(festivalLogo, width / 2 - logoW / 2, yStart + 40, logoW, logoH);
  } else {
    ctx.font = "900 36px system-ui, -apple-system, sans-serif";
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText("SRI LANKA FINTECH FESTIVAL 2026", width / 2, yStart + 80);
  }

  // Event Location & Dates
  ctx.font = "600 18px system-ui, -apple-system, sans-serif";
  ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
  ctx.fillText("Shangri-La Colombo, Sri Lanka  ·  2–3 November 2026", width / 2, yStart + 128);

  // Tournament Badge
  const badgeY = yStart + 150;
  drawRoundedRect(ctx, width / 2 - 210, badgeY, 420, 36, 18);
  ctx.fillStyle = "rgba(254, 192, 31, 0.14)";
  ctx.fill();
  ctx.strokeStyle = "rgba(254, 192, 31, 0.6)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = "#FEC01F";
  ctx.font = "bold 14px system-ui, -apple-system, sans-serif";
  ctx.fillText("★ OFFICIAL ARENA TOURNAMENT CERTIFICATE ★", width / 2, badgeY + 23);
  ctx.restore();

  // 3. Main Glassmorphic Result Plaque
  const cardY = badgeY + 60;
  const cardWidth = 920;
  const cardHeight = options.format === "story" ? 680 : 540;
  const cardX = (width - cardWidth) / 2;

  // Outcome styling
  const isWon = options.outcome === "player_won";
  const isElim = options.outcome === "player_eliminated";
  const outcomeText = isWon
    ? "ARENA CHAMPION · VICTORY"
    : isElim
    ? "RISK AUDIT CONCLUDED"
    : "MATCH FINISHED";
  const outcomeGlow = isWon ? "#FEC01F" : isElim ? "#F43F5E" : "#1CA085";

  ctx.save();
  // Plaque backing
  drawRoundedRect(ctx, cardX, cardY, cardWidth, cardHeight, 32);
  const cardGrad = ctx.createLinearGradient(0, cardY, 0, cardY + cardHeight);
  cardGrad.addColorStop(0, "rgba(255, 255, 255, 0.07)");
  cardGrad.addColorStop(1, "rgba(8, 12, 38, 0.85)");
  ctx.fillStyle = cardGrad;
  ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 20;
  ctx.fill();

  // Plaque border
  ctx.strokeStyle = isWon ? "rgba(254, 192, 31, 0.75)" : "rgba(255, 255, 255, 0.18)";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();

  // Player Name & Title
  ctx.save();
  ctx.textAlign = "center";
  ctx.font = "bold 34px system-ui, -apple-system, sans-serif";
  ctx.fillStyle = "#FFFFFF";
  ctx.fillText(options.displayName, width / 2, cardY + 65);

  // Outcome Pill
  const pillW = 320;
  const pillH = 40;
  const pillY = cardY + 86;
  ctx.save();
  drawRoundedRect(ctx, width / 2 - pillW / 2, pillY, pillW, pillH, 20);
  ctx.fillStyle = isWon ? "#125252" : isElim ? "#8D1739" : "#F57222";
  ctx.fill();
  ctx.strokeStyle = outcomeGlow;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 16px system-ui, -apple-system, sans-serif";
  ctx.fillText(outcomeText, width / 2, pillY + 25);
  ctx.restore();

  // "OFFICIAL TOURNAMENT SCORE" Label
  ctx.fillStyle = "#FEC01F";
  ctx.font = "bold 16px system-ui, -apple-system, sans-serif";
  ctx.letterSpacing = "3px";
  ctx.fillText("OFFICIAL ARENA SCORE", width / 2, cardY + 168);

  // Giant High-Tech Score Display
  ctx.font = "900 96px system-ui, -apple-system, sans-serif";
  const scoreGrad = ctx.createLinearGradient(0, cardY + 175, 0, cardY + 275);
  scoreGrad.addColorStop(0, "#FFFFFF");
  scoreGrad.addColorStop(1, "#FEC01F");
  ctx.fillStyle = scoreGrad;
  ctx.fillText(options.finalScore.toLocaleString(), width / 2, cardY + 265);

  // Leaderboard Rank Pill (if opted-in)
  if (options.rank) {
    const rankPillW = 380;
    const rankPillY = cardY + 295;
    ctx.save();
    drawRoundedRect(ctx, width / 2 - rankPillW / 2, rankPillY, rankPillW, 38, 19);
    ctx.fillStyle = "rgba(245, 114, 34, 0.15)";
    ctx.fill();
    ctx.strokeStyle = "#F57222";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = "#F57222";
    ctx.font = "bold 18px system-ui, -apple-system, sans-serif";
    ctx.fillText(`🏆 Rank #${options.rank} on Festival Leaderboard`, width / 2, rankPillY + 25);
    ctx.restore();
  }

  // Stats Grid: 3 Distinct Metric Cards
  const statsY = cardY + (options.rank ? 355 : 320);
  const colWidth = (cardWidth - 80) / 3;

  drawMetricCard(
    ctx,
    cardX + 28,
    statsY,
    colWidth,
    options.format === "story" ? 120 : 100,
    "❤️ HEARTS LEFT",
    `${options.heartsRemaining} / 3`,
    "Resilience"
  );
  drawMetricCard(
    ctx,
    cardX + 38 + colWidth,
    statsY,
    colWidth,
    options.format === "story" ? 120 : 100,
    "💡 FINTECH IQ",
    `${options.quizCorrect} Correct`,
    "Domain Mastery"
  );
  drawMetricCard(
    ctx,
    cardX + 48 + colWidth * 2,
    statsY,
    colWidth,
    options.format === "story" ? 120 : 100,
    "🛡️ SHIELDS & TREASURE",
    `${options.treasuresCollected} Claimed`,
    "Risk Safeguard"
  );
  ctx.restore();

  // 4. Scannable QR Code & Challenge Section
  const qrBoxY = cardY + cardHeight + (options.format === "story" ? 45 : 30);
  const qrBoxSize = options.format === "story" ? 270 : 230;
  const qrBoxX = width / 2 - qrBoxSize / 2;

  // QR Code Frame with Gold Rim
  ctx.save();
  drawRoundedRect(ctx, qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 24);
  ctx.fillStyle = "#FFFFFF";
  ctx.shadowColor = "rgba(254, 192, 31, 0.35)";
  ctx.shadowBlur = 25;
  ctx.shadowOffsetY = 6;
  ctx.fill();
  ctx.strokeStyle = "#FEC01F";
  ctx.lineWidth = 3;
  ctx.stroke();

  // Draw QR Image
  const qrPadding = options.format === "story" ? 18 : 14;
  ctx.drawImage(
    qrImage,
    qrBoxX + qrPadding,
    qrBoxY + qrPadding,
    qrBoxSize - qrPadding * 2,
    qrBoxSize - qrPadding * 2
  );
  ctx.restore();

  // Call-to-action text
  ctx.save();
  ctx.textAlign = "center";
  ctx.fillStyle = "#FEC01F";
  ctx.font = "900 26px system-ui, -apple-system, sans-serif";
  ctx.letterSpacing = "1px";
  ctx.fillText("SCAN TO BEAT THIS SCORE", width / 2, qrBoxY + qrBoxSize + 42);

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "600 18px system-ui, -apple-system, sans-serif";
  ctx.fillText(
    "Race against autonomous AI · Climb the Festival Hall of Fame",
    width / 2,
    qrBoxY + qrBoxSize + 72
  );

  ctx.fillStyle = "rgba(255, 255, 255, 0.65)";
  ctx.font = "500 16px system-ui, -apple-system, sans-serif";
  ctx.fillText(
    "Sri Lanka FinTech Festival 2026  ·  fintechfestival.lk  ·  #SLFinTechFest2026",
    width / 2,
    qrBoxY + qrBoxSize + 102
  );
  ctx.restore();

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Failed to export canvas blob"));
    }, "image/png");
  });
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

function drawMetricCard(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  title: string,
  value: string,
  subtitle: string
) {
  ctx.save();
  drawRoundedRect(ctx, x, y, w, h, 18);
  ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.textAlign = "center";
  ctx.fillStyle = "#FEC01F";
  ctx.font = "bold 13px system-ui, -apple-system, sans-serif";
  ctx.fillText(title, x + w / 2, y + 28);

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "900 24px system-ui, -apple-system, sans-serif";
  ctx.fillText(value, x + w / 2, y + 60);

  ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
  ctx.font = "500 11px system-ui, -apple-system, sans-serif";
  ctx.fillText(subtitle, x + w / 2, y + 80);
  ctx.restore();
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
