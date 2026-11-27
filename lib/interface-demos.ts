export const INTERFACE_DEMOS = {
  squash: { name: "Squash and stretch", variants: ["Whole button", "Surface only"] },
  anticipation: { name: "Anticipation", variants: ["After the click", "Before the click"] },
  staging: { name: "Staging", variants: ["Whole inbox moves", "Only filters move"] },
  poses: { name: "Straight ahead and pose to pose", variants: ["Several keyframes", "Two poses"] },
  stagger: { name: "Follow through and overlap", variants: ["Together", "60ms apart"] },
  easing: { name: "Slow in and slow out", variants: ["Linear", "Ease-out"] },
  arc: { name: "Arcs", variants: ["Straight path", "Curved path"] },
  secondary: { name: "Secondary action", variants: ["Competing confirmation", "Quiet confirmation"] },
  duration: { name: "Timing", variants: ["400ms", "180ms"] },
  shake: { name: "Exaggeration", variants: ["Message only", "Message and shake"] },
  depth: { name: "Solid drawing", variants: ["Flat panel", "Raised panel"] },
  appeal: { name: "Appeal", variants: ["Instant", "Small flourish"] },
} as const;

export type InterfaceDemoKind = keyof typeof INTERFACE_DEMOS;
