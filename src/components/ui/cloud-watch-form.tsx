"use client";

import React, { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/**
 * Cloud Watch form — the "watching cloud" mascot pattern.
 *
 * A friendly cloud character whose pupils track the visitor's cursor,
 * blinks every few seconds, and closes its eyes while a password field
 * is being typed (privacy with personality). Used on lead-capture forms:
 * place <CloudWatchFace /> next to the form heading and pass
 * `closed` when the visitor types sensitive input.
 *
 * The face is inline SVG (no external image) so the eye geometry always
 * matches, and colors come from theme tokens for dark-mode parity.
 */

/** Normalized cursor position (-0.5…0.5 per axis), null until first mousemove. */
function useNormalizedCursor(): { x: number; y: number } | null {
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const handleMouse = (event: MouseEvent) =>
      setCursor({ x: event.clientX, y: event.clientY });
    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, []);

  if (!cursor || typeof window === "undefined") return null;
  return {
    x: cursor.x / window.innerWidth - 0.5,
    y: cursor.y / window.innerHeight - 0.5,
  };
}

function useBlink(active: boolean): boolean {
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    if (active) return; // eyes stay closed — no blinking needed
    const interval = setInterval(() => {
      setBlink(true);
      const timeout = setTimeout(() => setBlink(false), 200);
      return () => clearTimeout(timeout);
    }, 3000);
    return () => clearInterval(interval);
  }, [active]);

  return blink;
}

const PUPIL_RANGE_X = 5; // px of pupil travel inside a 10-radius eye
const PUPIL_RANGE_Y = 3;

interface CloudWatchFaceProps {
  /** Eyes fully closed (e.g. password typing) instead of tracking. */
  closed?: boolean;
  /** "look" follows the cursor; "idle" keeps pupils centered (touch devices). */
  behavior?: "look" | "idle";
  className?: string;
}

/** The cloud mascot. Size via className width (SVG keeps its aspect ratio). */
export function CloudWatchFace({
  closed = false,
  behavior = "look",
  className,
}: CloudWatchFaceProps) {
  const cursor = useNormalizedCursor();
  const blinking = useBlink(closed);
  const shut = closed || blinking;

  const pupilX =
    behavior === "look" && cursor
      ? Math.max(-1, Math.min(1, cursor.x * 2)) * PUPIL_RANGE_X
      : 0;
  const pupilY =
    behavior === "look" && cursor
      ? Math.max(-1, Math.min(1, cursor.y * 2)) * PUPIL_RANGE_Y
      : 0;

  // Eye geometry in the 120×76 viewBox.
  const eyes = [
    { cx: 44, cy: 42 },
    { cx: 76, cy: 42 },
  ];

  return (
    <svg
      viewBox="0 0 120 76"
      role="img"
      aria-label={closed ? "Cloud mascot covering its eyes" : "Cloud mascot watching"}
      className={cn("w-32 select-none", className)}
    >
      {/* Cloud body — overlapping lobes, theme-token fill */}
      <g className="fill-card">
        <circle cx="30" cy="48" r="22" />
        <circle cx="60" cy="36" r="27" />
        <circle cx="90" cy="48" r="22" />
        <rect x="28" y="42" width="64" height="28" rx="14" />
      </g>

      {/* Smile — drops to an "o" while the eyes are shut */}
      {shut ? (
        <circle
          cx="60"
          cy="58"
          r="4"
          className="fill-none stroke-foreground"
          strokeWidth="2.5"
        />
      ) : (
        <path
          d="M48 56 Q60 66 72 56"
          className="fill-none stroke-foreground"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      )}

      {eyes.map((eye) => {
        if (shut) {
          // Closed lid — a gentle downward arc reads friendlier than a bar.
          return (
            <path
              key={eye.cx}
              d={`M ${eye.cx - 9} ${eye.cy} Q ${eye.cx} ${eye.cy + 5} ${eye.cx + 9} ${eye.cy}`}
              className="fill-none stroke-foreground"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          );
        }
        return (
          <g key={eye.cx}>
            <circle cx={eye.cx} cy={eye.cy} r="10" fill="white" />
            <circle
              cx={eye.cx}
              cy={eye.cy}
              r="4.5"
              fill="black"
              style={{
                transform: `translate(${pupilX}px, ${pupilY}px)`,
                transition: "transform 0.1s ease",
              }}
            />
          </g>
        );
      })}
    </svg>
  );
}

/**
 * Standalone demo/signup form showing the full pattern: the mascot closes
 * its eyes while the password field is focused. Not wired to any endpoint —
 * use as a reference or drop into an auth flow when one exists.
 */
export default function CloudWatchForm() {
  const [passwordFocused, setPasswordFocused] = useState(false);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="flex w-full max-w-md flex-col items-center gap-6 rounded-xl border bg-card/60 p-8 shadow-xl backdrop-blur-md">
        <CloudWatchFace closed={passwordFocused} className="w-44" />

        <div className="flex w-full flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cwf-name">Name</Label>
            <Input id="cwf-name" placeholder="Your Name" autoComplete="name" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cwf-email">Email</Label>
            <Input id="cwf-email" type="email" placeholder="Your Email" autoComplete="email" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cwf-username">Username</Label>
            <Input id="cwf-username" placeholder="Username" autoComplete="username" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cwf-password">Password</Label>
            <Input
              id="cwf-password"
              type="password"
              placeholder="Password"
              autoComplete="new-password"
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
            />
          </div>
          <Button className="mt-2 w-full">Submit</Button>
        </div>
      </div>
    </div>
  );
}
