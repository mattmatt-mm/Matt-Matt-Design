"use client";

import type { PostHog } from "posthog-js";

/**
 * Engagement tracking (doc/hr-mode-plan.md). The AI asks for cookies on a
 * first visit; PostHog is only ever loaded after "Accept". Until then — and
 * for anyone who declines — nothing is sent at all. The answer is kept, so it
 * is asked once. Without NEXT_PUBLIC_POSTHOG_KEY every call here is a no-op.
 */

const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";
const CONSENT_KEY = "mmd:tracking";

let client: PostHog | null = null;
let loading: Promise<PostHog | null> | null = null;
const queue: [string, Record<string, unknown>?][] = [];

export type TrackingDecision = "granted" | "denied" | null;

/** The visitor's cookie answer, or null if they have not given one. */
export function trackingDecision(): TrackingDecision {
  try {
    const value = window.localStorage.getItem(CONSENT_KEY);
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    return null;
  }
}

function storedConsent() {
  return trackingDecision() === "granted";
}

async function load(): Promise<PostHog | null> {
  if (!KEY) return null;
  if (client) return client;
  loading ??= import("posthog-js").then(({ default: posthog }) => {
    posthog.init(KEY, {
      // Proxied through our own domain (next.config.ts) so blockers keep it.
      api_host: "/ingest",
      ui_host: HOST.replace(".i.posthog.com", ".posthog.com"),
      defaults: "2025-05-24",
      capture_pageview: "history_change",
      capture_pageleave: true,
      autocapture: true,
      enable_heatmaps: true,
      person_profiles: "always",
      session_recording: { maskAllInputs: true },
    });
    const ref = new URLSearchParams(window.location.search).get("ref");
    if (ref) posthog.register({ ref });
    client = posthog;
    for (const [event, props] of queue.splice(0)) posthog.capture(event, props);
    return posthog;
  });
  return loading;
}

/** Start tracking on a return visit from someone who already said yes. */
export function resumeTracking() {
  if (storedConsent()) void load();
}

/** The AI's cookie question, "Accept": remember the yes and start recording. */
export function grantTracking() {
  try {
    window.localStorage.setItem(CONSENT_KEY, "granted");
  } catch {
    // Private mode: tracking still runs for this visit.
  }
  void load();
}

/** "Decline": remember the no, so the question is not asked again. */
export function denyTracking() {
  try {
    window.localStorage.setItem(CONSENT_KEY, "denied");
  } catch {
    // Private mode: they may be asked again next visit.
  }
}

/** Record a named event. Dropped unless the visitor has opted in. */
export function track(event: string, props?: Record<string, unknown>) {
  if (!KEY) return;
  if (client) client.capture(event, props);
  else if (loading || storedConsent()) {
    queue.push([event, props]);
    void load();
  }
}
