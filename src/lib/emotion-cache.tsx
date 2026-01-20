"use client";

import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import React from "react";

export function createEmotionCache() {
  return createCache({
    key: "mui",
    prepend: true, // 🔴 REQUIRED to avoid hydration mismatch
  });
}
