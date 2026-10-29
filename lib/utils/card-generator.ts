import QRCode from "qrcode";

export interface CardRenderOptions {
  format: "post" | "story"; // post: 1122x1402, story: 1080x1920
  displayName: string;
  avatarUrl?: string | null;
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
  if (options.format === "story") {
    return generateStoryCardBlob(options);
  }
  return generatePostCardBlob(options);
}

/**
 * Generates the official customized 4:5 portrait post card (1122 x 1402 px)
 * based directly on the official festival "& WON!" victory asset.
 */
async function generatePostCardBlob(options: CardRenderOptions): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = 1122;
  canvas.height = 1402;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not create canvas 2d context");

  // 1. Generate Dynamic Challenge QR Code
  const qrDataUrl = await QRCode.toDataURL(options.challengeUrl, {
    width: 230,
    margin: 1,
    color: {
      dark: "#06061F",
      light: "#FFFFFF",
    },
  });

  // 2. Load all image assets concurrently
  const [baseImage, crownImage, qrImage, avatarImage] = await Promise.all([
    loadImage("/share-card-clean.png").catch(() => null),
    loadImage("/share-card-crown.png").catch(() => null),
    loadImage(qrDataUrl),
    options.avatarUrl ? loadImage(options.avatarUrl).catch(() => null) : Promise.resolve(null),
  ]);

  if (baseImage) {
    // Draw the pristine official festival template
    ctx.drawImage(baseImage, 0, 0, 1122, 1402);
  } else {
    // Fallback if template image fails to load
    drawFallbackPostBackdrop(ctx, 1122, 1402, options);
  }

  // 3. Render Left Text: "I scored [Score] points"
  ctx.save();
  ctx.font = "800 34px 'Sora', system-ui, -apple-system, sans-serif";
  ctx.shadowColor = "#7a1104";
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 3;
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#FFFFFF";
  ctx.fillText("I scored ", 135, 670);
  const prefixWidth = ctx.measureText("I scored ").width;
  ctx.fillStyle = "#FED136";
  ctx.fillText(`${options.finalScore.toLocaleString()} points`, 135 + prefixWidth, 670);
  ctx.restore();

  // 4. Render Player Name Pill Badge above Score Badge
  const pillX = 745;
  const pillY = 638;
  const pillW = 300;
  const pillH = 36;
  ctx.save();
  ctx.shadowColor = "rgba(0, 0, 0, 0.45)";
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 4;
  drawRoundedRect(ctx, pillX, pillY, pillW, pillH, 18);
  const pillGrad = ctx.createLinearGradient(pillX, 0, pillX + pillW, 0);
  pillGrad.addColorStop(0, "rgba(4, 42, 45, 0.95)");
  pillGrad.addColorStop(1, "rgba(8, 55, 59, 0.95)");
  ctx.fillStyle = pillGrad;
  ctx.fill();
  ctx.strokeStyle = "#FEC01F";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.shadowColor = "transparent";
  ctx.fillStyle = "#FEC01F";
  ctx.textAlign = "center";
  ctx.font = "bold 15px 'Sora', system-ui, -apple-system, sans-serif";
  const cleanName = (options.displayName || "CHALLENGER").toUpperCase();
  ctx.fillText(`PLAYER: ${cleanName}`, pillX + pillW / 2, pillY + 23);
  ctx.restore();

  // 5. Render Dynamic Avatar inside Badge
  const avatarCenterX = 806;
  const avatarCenterY = 744;
  const avatarRadius = 50;

  ctx.save();
  ctx.beginPath();
  ctx.arc(avatarCenterX, avatarCenterY, avatarRadius, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();

  if (avatarImage) {
    ctx.drawImage(
      avatarImage,
      avatarCenterX - avatarRadius,
      avatarCenterY - avatarRadius,
      avatarRadius * 2,
      avatarRadius * 2
    );
  } else {
    // Elegant dark emerald circular avatar with gold initials
    const avGrad = ctx.createRadialGradient(
      avatarCenterX,
      avatarCenterY,
      8,
      avatarCenterX,
      avatarCenterY,
      avatarRadius
    );
    avGrad.addColorStop(0, "#0e4347");
    avGrad.addColorStop(1, "#042224");
    ctx.fillStyle = avGrad;
    ctx.fillRect(
      avatarCenterX - avatarRadius,
      avatarCenterY - avatarRadius,
      avatarRadius * 2,
      avatarRadius * 2
    );

    ctx.fillStyle = "#FEC01F";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "bold 32px 'Sora', system-ui, -apple-system, sans-serif";
    const initials = getInitials(options.displayName);
    ctx.fillText(initials, avatarCenterX, avatarCenterY + 2);
  }
  ctx.restore();

  // Circular Gold Rim Stroke around Avatar
  ctx.save();
  ctx.beginPath();
  ctx.arc(avatarCenterX, avatarCenterY, avatarRadius, 0, Math.PI * 2);
  ctx.strokeStyle = "#FEC01F";
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.restore();

  // Re-draw Golden Crown at the top of the rim
  if (crownImage) {
    ctx.drawImage(crownImage, 830, 685, 35, 35);
  }

  // 6. Render Dynamic Score inside the Score Badge
  ctx.save();
  ctx.textAlign = "center";
  const scoreStr = options.finalScore.toLocaleString();
  const fontSize = scoreStr.length > 5 ? 40 : 48;
  ctx.font = `900 ${fontSize}px 'Sora', system-ui, -apple-system, sans-serif`;
  ctx.shadowColor = "#7a1104";
  ctx.shadowOffsetX = 3;
  ctx.shadowOffsetY = 3;
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#FED136";
  ctx.fillText(scoreStr, 948, 768);
  ctx.restore();

  // 7. Render Dynamic Scannable QR Code in bottom-right green bar
  ctx.drawImage(qrImage, 953, 1211, 114, 114);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Failed to export post card blob"));
    }, "image/png");
  });
}

/**
 * Generates the official 9:16 vertical Story format (1080 x 1920 px)
 * optimized for Instagram Stories, WhatsApp Status, Facebook Stories, and TikTok.
 */
async function generateStoryCardBlob(options: CardRenderOptions): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1920;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not create canvas 2d context");

  // 1. First generate the customized 4:5 post card on an offscreen canvas
  const postBlob = await generatePostCardBlob({ ...options, format: "post" });
  const postUrl = URL.createObjectURL(postBlob);
  const postImg = await loadImage(postUrl);

  // 2. Luxury Festival Backdrop
  const bgGrad = ctx.createLinearGradient(0, 0, 0, 1920);
  bgGrad.addColorStop(0, "#2a020d");
  bgGrad.addColorStop(0.5, "#3c0516");
  bgGrad.addColorStop(1, "#1e0209");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1080, 1920);

  // Top and bottom ambient radial glows
  const topGlow = ctx.createRadialGradient(540, 180, 50, 540, 180, 550);
  topGlow.addColorStop(0, "rgba(105, 9, 36, 0.75)");
  topGlow.addColorStop(1, "rgba(42, 2, 13, 0)");
  ctx.fillStyle = topGlow;
  ctx.fillRect(0, 0, 1080, 900);

  const botGlow = ctx.createRadialGradient(540, 1750, 50, 540, 1750, 600);
  botGlow.addColorStop(0, "rgba(20, 79, 82, 0.65)");
  botGlow.addColorStop(1, "rgba(30, 2, 9, 0)");
  ctx.fillStyle = botGlow;
  ctx.fillRect(0, 1200, 1080, 720);

  // Subtle cyber grid dots
  ctx.save();
  ctx.fillStyle = "rgba(254, 192, 31, 0.08)";
  for (let x = 40; x < 1080; x += 50) {
    for (let y = 40; y < 280; y += 50) {
      ctx.beginPath();
      ctx.arc(x, y, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    for (let y = 1600; y < 1920; y += 50) {
      ctx.beginPath();
      ctx.arc(x, y, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();

  // 3. Story Header
  ctx.save();
  ctx.textAlign = "center";
  ctx.font = "900 28px 'Sora', system-ui, -apple-system, sans-serif";
  ctx.fillStyle = "#FEC01F";
  ctx.letterSpacing = "3px";
  ctx.fillText("SRI LANKA FINTECH FESTIVAL 2026", 540, 145);

  ctx.font = "700 18px 'Sora', system-ui, -apple-system, sans-serif";
  ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
  ctx.letterSpacing = "1.5px";
  ctx.fillText("OFFICIAL ARENA CHALLENGE · SHANGRI-LA COLOMBO", 540, 195);
  ctx.restore();

  // 4. Centered Card Plaque with Realistic Drop Shadow
  const cardW = 980;
  const cardH = 1225; // 980 / 1122 * 1402 = 1224.5
  const cardX = (1080 - cardW) / 2;
  const cardY = 310;

  ctx.save();
  ctx.shadowColor = "rgba(0, 0, 0, 0.65)";
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 18;
  ctx.drawImage(postImg, cardX, cardY, cardW, cardH);
  ctx.restore();

  // 5. Story Footer Call to Action Button
  const btnW = 800;
  const btnH = 90;
  const btnX = (1080 - btnW) / 2;
  const btnY = 1690;

  ctx.save();
  ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
  ctx.shadowBlur = 20;
  ctx.shadowOffsetY = 8;
  drawRoundedRect(ctx, btnX, btnY, btnW, btnH, 45);
  const btnGrad = ctx.createLinearGradient(btnX, 0, btnX + btnW, 0);
  btnGrad.addColorStop(0, "rgba(18, 82, 82, 0.92)");
  btnGrad.addColorStop(1, "rgba(28, 115, 115, 0.92)");
  ctx.fillStyle = btnGrad;
  ctx.fill();
  ctx.strokeStyle = "#FEC01F";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.shadowColor = "transparent";
  ctx.textAlign = "center";
  ctx.font = "900 24px 'Sora', system-ui, -apple-system, sans-serif";
  ctx.fillStyle = "#FED136";
  ctx.letterSpacing = "1.2px";
  ctx.fillText("SCAN QR OR PLAY AT FINTECHFESTIVAL.LK", 540, btnY + 54);

  ctx.font = "600 16px 'Sora', system-ui, -apple-system, sans-serif";
  ctx.fillStyle = "rgba(255, 255, 255, 0.65)";
  ctx.fillText(
    "LKR 10,000 Event Access to Top Arena Scorers · Closes Oct 31st",
    540,
    btnY + 128
  );
  ctx.restore();

  URL.revokeObjectURL(postUrl);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Failed to export story card blob"));
    }, "image/png");
  });
}

function drawFallbackPostBackdrop(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  options: CardRenderOptions
) {
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, "#3c0516");
  bgGrad.addColorStop(1, "#1e0209");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "900 64px system-ui, -apple-system, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("I PLAYED & WON!", width / 2, 400);

  ctx.fillStyle = "#FED136";
  ctx.font = "900 80px system-ui, -apple-system, sans-serif";
  ctx.fillText(`${options.finalScore.toLocaleString()} PTS`, width / 2, 700);
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

function getInitials(name: string): string {
  if (!name) return "FP";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (!src.startsWith("data:") && !src.startsWith("blob:")) {
      img.crossOrigin = "anonymous";
    }
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
