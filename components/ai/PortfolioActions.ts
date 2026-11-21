"use client";

import { createContext } from "react";

export type PortfolioAction = "chat" | "walkthrough";

export const PortfolioActions = createContext<
  ((action: PortfolioAction, opener: HTMLButtonElement) => void) | null
>(null);
