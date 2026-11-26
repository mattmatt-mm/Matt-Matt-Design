export const letsWorkDefaults = {
  introMeetingDescription: "An introductory call to talk through your project.",
  consultingDescription: "A working session for design feedback or help with a UX problem.",
  consultingPrice: "HK$450/hr",
  websiteDescription: "A one-page landing site with micro-animations, Vercel setup, and SEO setup.",
  websitePrice: "HK$7,000",
  subscriptionDescription: "Ongoing brand, web, and UI/UX design.",
  subscriptionPrice: "HK$30,000/month",
};

export type LetsWorkSettings = typeof letsWorkDefaults & { bookingUrl: string | null };
