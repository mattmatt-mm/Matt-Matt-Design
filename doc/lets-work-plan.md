# Let’s work page

*Built on 2026-11-25*

## Visitor flow

1. The **Let’s work** button on Home opens `/lets-work`.
2. The page opens with **Let’s work** and a primary **Contact me** button. The button uses the existing contact address from site settings to open an email draft.
3. Three sections present the services in this order. Each service pairs its price with a short description and an action.

| Section | Offer | Price | Scope | Action |
| --- | --- | --- | --- | --- |
| Meetings | Introductory meeting | Free | A 30-minute video call about the visitor’s project. | **Book a meeting** opens Cal.com. The email fallback reads **Request a free meeting**. |
| Meetings | UI/UX consulting | HK$450/hr | A working session for feedback on a design or help with a UX problem. | **Request consulting** opens an email draft with the service named in the subject. |
| Websites | Website design sprint | HK$7,000 | A one-page landing site with micro-animations, Vercel setup, and SEO setup. | **Ask about a website sprint** opens an email draft. |
| Subscription | Monthly design subscription | HK$30,000/month | Ongoing brand, web, and UI/UX design. | **Ask about a subscription** opens an email draft. |

## Layout

Use the portfolio’s existing 640px content column, type styles, and light and dark theme tokens. Set the offers in flat rows with hairline dividers. Align prices opposite the offer names when space allows, and let them wrap on narrow screens. Use the filled Home action pill for **Contact me** and text links for the offer actions. Use the dock’s Back behavior with Home as the destination when the visitor opens the page directly.

## Implementation sequence

1. Create the static `/lets-work` route with its own page title, description, canonical URL, and sitemap entry.
2. Add editable offer descriptions, prices, and an optional scheduling URL to the existing Keystatic site settings. Use the current `getSettings` reader with defaults for records created before the new fields exist.
3. Point the Home button to the new route and wire the contact and offer links. Give the email drafts distinct subjects so Matt can identify the service.
4. Verify the Home link, direct navigation, Back behavior, all contact links, and the booking-link fallback. Check the page at 375px and 1280px in both themes, including keyboard focus and the production build.

## Booking setup

- The free call uses Cal Video and the account’s existing availability. [Cal.com booking page](https://cal.com/mattmatt-mm/free-introductory-call)
- Update prices, descriptions, or the booking URL in Keystatic under **Site settings** → **Let’s work**. The sprint and subscription prices are in Hong Kong dollars, matching the consulting rate.
