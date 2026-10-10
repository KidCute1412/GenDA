"use client";
import { useSyncExternalStore } from "react";
import { createSeedLedger, getLedger, subscribeLedger } from "./store";
const serverSeed = createSeedLedger();
export function useDemoLedger() { return useSyncExternalStore(subscribeLedger, getLedger, () => serverSeed); }
