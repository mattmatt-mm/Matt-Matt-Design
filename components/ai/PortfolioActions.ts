"use client";

import { createContext } from "react";

export const GUIDED_WALKTHROUGH_LABEL = "Guided walkthrough";

export type PortfolioAction = "chat" | "walkthrough";

export const PortfolioActions = createContext<
  ((action: PortfolioAction, opener: HTMLButtonElement) => void) | null
>(null);
