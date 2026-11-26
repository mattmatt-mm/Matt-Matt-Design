import type { Metadata } from "next";
import { Column } from "@/components/Column";
import { getSettings } from "@/lib/content";
import { letsWorkPath } from "@/lib/site";

export const metadata: Metadata = {
  title: "Let’s work",
  description:
    "Book a meeting with Matt Tam or get in touch about UI/UX consulting, a landing page sprint, or a monthly design subscription.",
  alternates: { canonical: letsWorkPath },
};

function emailLink(email: string, subject: string) {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}`;
}

export default async function LetsWorkPage() {
  const { email, letsWork } = await getSettings();
  const sections = [
    {
      id: "meetings",
      title: "Meetings",
      offers: [
        {
          name: "Introductory meeting",
          price: "Free",
          description: letsWork.introMeetingDescription,
          action: letsWork.bookingUrl ? "Book a meeting" : "Request a free meeting",
          href: letsWork.bookingUrl ?? emailLink(email, "Free introductory meeting"),
        },
        {
          name: "UI/UX consulting",
          price: letsWork.consultingPrice,
          description: letsWork.consultingDescription,
          action: "Request consulting",
          href: emailLink(email, "UI/UX consulting"),
        },
      ],
    },
    {
      id: "websites",
      title: "Websites",
      offers: [
        {
          name: "Website design sprint",
          price: letsWork.websitePrice,
          description: letsWork.websiteDescription,
          action: "Ask about a website sprint",
          href: emailLink(email, "Website design sprint"),
        },
      ],
    },
    {
      id: "subscription",
      title: "Subscription",
      offers: [
        {
          name: "Monthly design subscription",
          price: letsWork.subscriptionPrice,
          description: letsWork.subscriptionDescription,
          action: "Ask about a subscription",
          href: emailLink(email, "Monthly design subscription"),
        },
      ],
    },
  ];

  return (
    <Column>
      <main>
        <header className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-title">Let’s work</h1>
          <a className="home-feed-action home-feed-primary press-shrink" href={`mailto:${email}`}>
            Contact me
          </a>
        </header>

        <div className="mt-12 space-y-8">
          {sections.map(({ id, title, offers }) => (
            <section key={id} aria-labelledby={id}>
              <h2 id={id} className="mb-3 text-section font-bold">{title}</h2>
              <ul className="divide-y divide-line border-t border-line" role="list">
                {offers.map(({ name, price, description, action, href }) => (
                  <li key={name} className="space-y-2 py-4 last:pb-0">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                      <h3 className="font-medium">{name}</h3>
                      <p className="font-medium tabular-nums">{price}</p>
                    </div>
                    <p className="text-muted-readable">{description}</p>
                    <a
                      className="inline-block py-1 underline decoration-line underline-offset-2 transition-colors hover:decoration-fg"
                      href={href}
                    >
                      {action}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </main>
    </Column>
  );
}
