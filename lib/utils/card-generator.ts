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

  // Generate QR Code data URL
  const qrDataUrl = await QRCode.toDataURL(options.challengeUrl, {
    width: 220,
    margin: 1,
    color: {
      dark: "#125252",
      light: "#FFFFFF",
    },
  });

  const qrImage = await loadImage(qrDataUrl);

  // 1. Background Gradient (Festival Teal & Deep Night)
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, "#0a2626");
  bgGrad.addColorStop(0.35, "#125252");
  bgGrad.addColorStop(0.7, "#174242");
  bgGrad.addColorStop(1, "#0d1f1f");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Subtle decorative geometric network accents
  ctx.save();
  ctx.strokeStyle = "rgba(254, 192, 31, 0.12)";
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.arc(width * 0.85, height * 0.15, 80 + i * 50, 0, Math.PI * 2);
    ctx.stroke();
  }
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.arc(width * 0.1, height * 0.85, 60 + i * 45, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();

  // Content vertical centering adjustment for story vs post
  const yOffset = options.format === "story" ? 180 : 70;

  // 2. Festival Header Badge
  const badgeY = yOffset + 50;
  ctx.save();
  drawRoundedRect(ctx, width / 2 - 250, badgeY, 500, 52, 26);
  ctx.fillStyle = "rgba(254, 192, 31, 0.15)";
  ctx.fill();
  ctx.strokeStyle = "#FEC01F";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = "#FEC01F";
  ctx.font = "bold 22px system-ui, -apple-system, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("SRI LANKA FINTECH FESTIVAL 2026", width / 2, badgeY + 34);
  ctx.restore();

  // 3. Game Title
  ctx.save();
  ctx.textAlign = "center";
  ctx.font = "900 68px system-ui, -apple-system, sans-serif";
  ctx.fillStyle = "#FFFFFF";
  ctx.fillText("LANKA FINTECHVERSE", width / 2, badgeY + 125);

  ctx.font = "600 24px system-ui, -apple-system, sans-serif";
  ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
  ctx.fillText("Official Snakes & Ladders Tournament", width / 2, badgeY + 165);
  ctx.restore();

  // 4. Outcome Card Box
  const cardY = badgeY + 210;
  const cardWidth = 920;
  const cardHeight = options.format === "story" ? 640 : 530;
  const cardX = (width - cardWidth) / 2;

  ctx.save();
  drawRoundedRect(ctx, cardX, cardY, cardWidth, cardHeight, 36);
  ctx.fillStyle = "rgba(255, 255, 255, 0.96)";
  ctx.shadowColor = "rgba(0, 0, 0, 0.35)";
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 15;
  ctx.fill();
  ctx.restore();

  // Outcome Icon & Title
  const isWon = options.outcome === "player_won";
  const isElim = options.outcome === "player_eliminated";
  const outcomeText = isWon ? "VICTORY" : isElim ? "ELIMINATED" : "RUN COMPLETED";
  const outcomeColor = isWon ? "#125252" : isElim ? "#8D1739" : "#F57222";

  ctx.save();
  ctx.textAlign = "center";

  // Player Name
  ctx.font = "bold 32px system-ui, -apple-system, sans-serif";
  ctx.fillStyle = "#4A5568";
  ctx.fillText(options.displayName, width / 2, cardY + 65);

  // Outcome pill
  const pillY = cardY + 90;
  drawRoundedRect(ctx, width / 2 - 140, pillY, 280, 44, 22);
  ctx.fillStyle = outcomeColor;
  ctx.fill();
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 20px system-ui, -apple-system, sans-serif";
  ctx.fillText(outcomeText, width / 2, pillY + 29);

  // Big Score Display
  ctx.fillStyle = "#718096";
  ctx.font = "600 20px system-ui, -apple-system, sans-serif";
  ctx.fillText("FINAL SCORE", width / 2, cardY + 185);

  ctx.fillStyle = "#125252";
  ctx.font = "900 86px system-ui, -apple-system, sans-serif";
  ctx.fillText(options.finalScore.toLocaleString(), width / 2, cardY + 270);

  // Leaderboard Rank if available
  if (options.rank) {
    ctx.fillStyle = "#F57222";
    ctx.font = "bold 24px system-ui, -apple-system, sans-serif";
    ctx.fillText(`🏆 Rank #${options.rank} on Official Leaderboard`, width / 2, cardY + 315);
  }

  // Stats Grid in card
  const statBoxY = cardY + (options.rank ? 345 : 320);
  const colWidth = (cardWidth - 80) / 3;

  drawStatBox(ctx, cardX + 30, statBoxY, colWidth, 90, "❤️ HEARTS", `${options.heartsRemaining} / 3`);
  drawStatBox(ctx, cardX + 40 + colWidth, statBoxY, colWidth, 90, "📝 QUIZ SCORE", `${options.quizCorrect} Correct`);
  drawStatBox(ctx, cardX + 50 + colWidth * 2, statBoxY, colWidth, 90, "💰 TREASURES", `${options.treasuresCollected} Claimed`);
  ctx.restore();

  // 5. Campaign Call To Action & QR Section
  const qrSectionY = cardY + cardHeight + 40;

  // QR Code Box (white rounded card)
  const qrBoxSize = 250;
  const qrBoxX = width / 2 - qrBoxSize / 2;
  ctx.save();
  drawRoundedRect(ctx, qrBoxX, qrSectionY, qrBoxSize, qrBoxSize, 24);
  ctx.fillStyle = "#FFFFFF";
  ctx.shadowColor = "rgba(0, 0, 0, 0.25)";
  ctx.shadowBlur = 20;
  ctx.fill();
  ctx.drawImage(qrImage, qrBoxX + 15, qrSectionY + 15, 220, 220);
  ctx.restore();

  // Campaign Message
  ctx.save();
  ctx.textAlign = "center";
  ctx.fillStyle = "#FEC01F";
  ctx.font = "900 28px system-ui, -apple-system, sans-serif";
  ctx.fillText("SCAN TO BEAT MY SCORE", width / 2, qrSectionY + qrBoxSize + 48);

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "700 22px system-ui, -apple-system, sans-serif";
  ctx.fillText("PLAY THE GAME · CLIMB THE LEADERBOARD · CHALLENGE FRIENDS", width / 2, qrSectionY + qrBoxSize + 85);

  ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
  ctx.font = "500 20px system-ui, -apple-system, sans-serif";
  ctx.fillText(`Join us at the Sri Lanka FinTech Festival 2026 — ${options.festivalDates}`, width / 2, qrSectionY + qrBoxSize + 120);

  ctx.fillStyle = "#FEC01F";
  ctx.font = "bold 20px system-ui, -apple-system, sans-serif";
  ctx.fillText("See you at the Festival!", width / 2, qrSectionY + qrBoxSize + 155);
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

function drawStatBox(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  label: string,
  val: string
) {
  drawRoundedRect(ctx, x, y, w, h, 16);
  ctx.fillStyle = "#F7FAFC";
  ctx.fill();
  ctx.strokeStyle = "#E2E8F0";
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = "#718096";
  ctx.font = "bold 13px system-ui, -apple-system, sans-serif";
  ctx.fillText(label, x + w / 2, y + 32);

  ctx.fillStyle = "#1A202C";
  ctx.font = "bold 22px system-ui, -apple-system, sans-serif";
  ctx.fillText(val, x + w / 2, y + 66);
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
