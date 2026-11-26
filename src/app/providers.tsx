"use client";

import { useEffect } from "react";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";

export function PHProvider({ children }: { children: React.ReactNode }) {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;
  const enabled =
    process.env.NODE_ENV === "production" && Boolean(key) && Boolean(host);

  useEffect(() => {
    if (!enabled || !key || !host) return;

    posthog.init(key, {
      api_host: host,
      capture_pageview: true,
    });
  }, [enabled, key, host]);

  if (!enabled) return <>{children}</>;

  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
