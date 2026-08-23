"use client";

import { SiteSquircle } from "@/components/SiteSquircle";
import { SunsetShimmer } from "@/components/effects/SunsetShimmer";

export function AiThinking() {
  return (
    <SiteSquircle asChild>
      <div
        className="ai-thinking elevated-surface"
        role="status"
        aria-label="Thinking"
      >
        <SunsetShimmer pauseBetween={500}>
          Thinking...
        </SunsetShimmer>
      </div>
    </SiteSquircle>
  );
}
