"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { UnitSystem } from "@/generated/prisma/client";

const STORAGE_KEY = "rl:unitSystem";

type Ctx = { unitSystem: UnitSystem; toggleUnitSystem: () => void };

const UnitSystemContext = createContext<Ctx | null>(null);

export function UnitSystemProvider({ children }: { children: React.ReactNode }) {
  const [unitSystem, setUnitSystem] = useState<UnitSystem>("METRIC");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "METRIC" || stored === "IMPERIAL") setUnitSystem(stored);
  }, []);

  const toggleUnitSystem = useCallback(() => {
    setUnitSystem((prev) => {
      const next = prev === "METRIC" ? "IMPERIAL" : "METRIC";
      window.localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  return <UnitSystemContext.Provider value={{ unitSystem, toggleUnitSystem }}>{children}</UnitSystemContext.Provider>;
}

export function useUnitSystem(): Ctx {
  const ctx = useContext(UnitSystemContext);
  if (!ctx) throw new Error("useUnitSystem must be used within a UnitSystemProvider");
  return ctx;
}
