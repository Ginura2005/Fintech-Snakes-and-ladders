import Image from "next/image";
import type { CSSProperties } from "react";

type CirclesPatternProps = {
  className?: string;
  /** `on-dark` for navy/burgundy; `on-light` for white/cream cards (matches main site). */
  tone?: "on-dark" | "on-light";
  /**
   * `hero` — left + right arcs fading toward the center.
   * `cta` — radial soft mask away from centered headlines.
   * `card` — full bleed inside a card.
   */
  placement?: "card" | "cta" | "hero";
  /** Which edge for a single hero panel (used internally / overrides). */
  side?: "left" | "right";
  coverage?: "full" | "top" | "bottom";
};

function heroRingStyle(side: "left" | "right"): CSSProperties {
  const anchoredLeft = side === "left";
  return {
    position: "absolute",
    top: "-18%",
    bottom: "-24%",
    width: "118%",
    ...(anchoredLeft
      ? { left: "-10%", right: "auto" }
      : { right: "-10%", left: "auto" }),
    opacity: 0.3,
    background:
      "linear-gradient(150deg, rgba(255,255,255,0.95) 0%, rgba(241,245,249,0.8) 50%, rgba(254,192,31,0.3) 100%)",
    WebkitMaskImage: "url(/elements/circles.webp)",
    maskImage: "url(/elements/circles.webp)",
    WebkitMaskSize: "cover",
    maskSize: "cover",
    WebkitMaskPosition: anchoredLeft ? "left center" : "right center",
    maskPosition: anchoredLeft ? "left center" : "right center",
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    maskMode: "luminance",
  };
}

/** Soft dissolve from the outer edge into the centered copy column. */
function heroFadeMask(side: "left" | "right"): CSSProperties {
  const towardCenter = side === "left" ? "to right" : "to left";
  const gradient = `linear-gradient(${towardCenter}, #000 0%, #000 10%, rgba(0,0,0,0.6) 28%, rgba(0,0,0,0.2) 48%, transparent 68%)`;
  return {
    WebkitMaskImage: gradient,
    maskImage: gradient,
  };
}

function HeroCirclesPanel({
  side,
  className = "",
}: {
  side: "left" | "right";
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={`hero-circles hero-circles--${side} pointer-events-none absolute inset-y-0 z-[1] w-[72%] sm:w-[52%] lg:w-[40%] xl:w-[36%] ${
        side === "left" ? "left-0" : "right-0"
      } ${className}`.trim()}
      style={heroFadeMask(side)}
    >
      <div className="hero-circles__rings" style={heroRingStyle(side)} />
    </div>
  );
}

/**
 * Brand concentric rings adapted from FinTech-Festival CirclesPattern.
 * Parent should be `relative overflow-hidden`; content stays `relative z-10`.
 */
export default function CirclesPattern({
  className = "",
  tone = "on-dark",
  placement = "card",
  side,
  coverage = "full",
}: CirclesPatternProps) {
  if (placement === "hero") {
    // Single side if requested; otherwise both edges dissolve into the center.
    if (side === "left" || side === "right") {
      return <HeroCirclesPanel side={side} className={className} />;
    }
    return (
      <>
        <HeroCirclesPanel side="left" className={className} />
        <HeroCirclesPanel side="right" className={className} />
      </>
    );
  }

  const coverageClass =
    coverage === "top"
      ? "absolute inset-x-0 top-0 h-[28%] min-h-24 [-webkit-mask-image:linear-gradient(to_bottom,black_0%,black_22%,transparent_100%)] [mask-image:linear-gradient(to_bottom,black_0%,black_22%,transparent_100%)]"
      : coverage === "bottom"
        ? "absolute inset-x-0 bottom-0 h-[30%] min-h-24 [-webkit-mask-image:linear-gradient(to_top,black_0%,black_22%,transparent_100%)] [mask-image:linear-gradient(to_top,black_0%,black_22%,transparent_100%)]"
        : "absolute inset-0";

  const ctaMask =
    placement === "cta"
      ? "scale-110 [-webkit-mask-image:radial-gradient(ellipse_at_center,transparent_18%,black_72%)] [mask-image:radial-gradient(ellipse_at_center,transparent_18%,black_72%)]"
      : "";

  const objectPos =
    coverage === "top" ? "object-top" : coverage === "bottom" ? "object-bottom" : "object-center";

  return (
    <div
      aria-hidden
      className={`pointer-events-none z-0 overflow-hidden ${coverageClass} ${ctaMask} ${className}`.trim()}
    >
      <Image
        src="/elements/circles.webp"
        alt=""
        fill
        quality={40}
        sizes="100vw"
        className={
          tone === "on-dark"
            ? `object-cover opacity-[0.42] mix-blend-screen ${objectPos}`
            : `object-cover opacity-[0.2] mix-blend-multiply invert ${objectPos}`
        }
      />
    </div>
  );
}
