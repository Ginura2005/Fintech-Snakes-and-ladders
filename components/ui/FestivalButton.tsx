"use client";

import Link from "next/link";
import {
  useCallback,
  type ButtonHTMLAttributes,
  type ComponentProps,
  type MouseEvent,
  type ReactNode,
} from "react";

type Variant = "primary" | "secondary" | "burgundy" | "outline";

const VARIANT: Record<Variant, string> = {
  primary: "interactive-btn interactive-btn--primary",
  secondary: "interactive-btn interactive-btn--secondary",
  burgundy: "interactive-btn interactive-btn--burgundy",
  outline: "interactive-btn interactive-btn--outline",
};

type SharedProps = {
  children: ReactNode;
  className?: string;
  variant?: Variant;
  showRipple?: boolean;
};

type AsLink = SharedProps &
  Omit<ComponentProps<typeof Link>, "className" | "children"> & {
    href: string;
  };

type AsButton = SharedProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> & {
    href?: undefined;
  };

export type FestivalButtonProps = AsLink | AsButton;

function useRippleHandlers(enabled: boolean) {
  return useCallback(
    (event: MouseEvent<HTMLElement>) => {
      if (!enabled) return;
      const rect = event.currentTarget.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      event.currentTarget.style.setProperty("--ripple-x", `${x}%`);
      event.currentTarget.style.setProperty("--ripple-y", `${y}%`);
    },
    [enabled]
  );
}

/**
 * Festival CTA adapted from FinTech-Festival InteractiveButton.
 * Supports both links and native buttons (game needs form actions).
 */
export default function FestivalButton(props: FestivalButtonProps) {
  const {
    children,
    className = "",
    variant = "primary",
    showRipple = true,
    ...rest
  } = props;
  const onMove = useRippleHandlers(showRipple);
  const classes = `${VARIANT[variant]} ${className}`.trim();

  const label = (
    <span className="interactive-btn__label">
      {Array.isArray(children)
        ? children.map((child, i) =>
            typeof child === "string" || typeof child === "number" ? (
              <span key={i} className="leading-none">
                {child}
              </span>
            ) : (
              child
            )
          )
        : typeof children === "string" || typeof children === "number" ? (
          <span className="leading-none">{children}</span>
        ) : (
          children
        )}
    </span>
  );

  if ("href" in props && props.href) {
    const { href, ...linkRest } = rest as AsLink;
    return (
      <Link
        href={href}
        className={classes}
        onMouseMove={onMove}
        {...linkRest}
      >
        {showRipple ? <span aria-hidden className="interactive-btn__ripple" /> : null}
        {label}
      </Link>
    );
  }

  const buttonRest = rest as AsButton;
  return (
    <button
      type={buttonRest.type ?? "button"}
      className={classes}
      onMouseMove={onMove}
      {...buttonRest}
    >
      {showRipple ? <span aria-hidden className="interactive-btn__ripple" /> : null}
      {label}
    </button>
  );
}
