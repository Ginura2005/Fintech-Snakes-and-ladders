"use client";

import { useState } from "react";
import { User as UserIcon } from "lucide-react";

type UserAvatarProps = {
  src?: string | null;
  alt?: string;
  fallbackText?: string;
  className?: string;
  iconSize?: number;
};

/**
 * Avatar image with Google-safe referrer policy and graceful fallback.
 * Google profile photos often 403 without referrerPolicy="no-referrer".
 */
export default function UserAvatar({
  src,
  alt = "Profile",
  fallbackText,
  className = "w-full h-full object-cover",
  iconSize = 12,
}: UserAvatarProps) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(src) && !failed;

  if (showImage) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src!}
        alt={alt}
        className={className}
        referrerPolicy="no-referrer"
        decoding="async"
        onError={() => setFailed(true)}
      />
    );
  }

  if (fallbackText) {
    return (
      <span className="inline-flex h-full w-full items-center justify-center font-bold text-primary text-[10px] tracking-wide">
        {fallbackText.slice(0, 2).toUpperCase()}
      </span>
    );
  }

  return <UserIcon size={iconSize} className="text-primary" aria-hidden />;
}
