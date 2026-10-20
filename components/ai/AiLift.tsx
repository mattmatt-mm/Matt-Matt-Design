/**
 * Carries a squircle surface's drop shadow. A filter on the squircle itself
 * is drawn before its clip path, which trims the shadow back to the edge, so
 * the shadow lives one element up (styles: `.ai-lift`).
 */
export function AiLift({ children }: { children: React.ReactNode }) {
  return <div className="ai-lift">{children}</div>;
}
