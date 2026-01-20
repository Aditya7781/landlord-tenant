"use client";

import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import React from "react";

const emotionCache = createCache({
  key: "mui",
  prepend: true, // 🔴 REQUIRED to avoid hydration mismatch
});

export default function EmotionCacheProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CacheProvider value={emotionCache}>{children}</CacheProvider>;
}
