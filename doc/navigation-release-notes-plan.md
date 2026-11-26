# Reliable dock navigation and curated releases

Create `codex/navigation-release-notes` from `main`.

## Dock

- Detail pages use a two-control capsule with Back and Home. Home opens `/`. The walkthrough retains its single X exit.
- Back uses the previous page recorded on the current history entry, so Back and Forward restore each entry’s own return target. Scroll-driven detail URL replacements retain that target. A direct arrival uses its section landing page.
- The installable Dynamic Dock exposes the same compact layout when supplied with `onHome`. Its demo uses Home to reset the selected tab and close the detail.
- Fun and Browse join Home and Writing in the shared tab layout. The existing 240ms entrance uses the dock order for direction, with 8px of movement and 2px of blur.

## Releases and component descriptions

- Publish one authored release note per visitor-facing PR. Keep the 13 archived versions at their original anchors. Version 0.1.14 covers the component library and dock navigation.
- Link the four library components and their uses in the release description. Use StageShow to simulate mouse gestures in a text-free grid on Releases. Each scene loops while visible, with the working demos linked in the release copy.
- The pull-card scene uses the Home badge’s distortion-waves renderer with a wider source and opaque textures for the smaller tile. The pointer’s drag controls the held wave, which releases and reverses across the tile.
- Describe what visitors can do in each demo in the shared copy for the catalog and detail pages.

## Acceptance checks

- Verify Back after in-site and external arrivals, detail-to-detail navigation, native Back and Forward, and a scroll-driven URL replacement. Check restoration of the previous page’s scroll position.
- Verify Home, the walkthrough exit, keyboard access, reduced motion, hit areas, and the Dynamic Dock registry item with both compact layouts.
- Switch between all four tabs in both directions and check that a direct load or a Fun filter change does not replay the entrance.
- Verify archive anchors, live component links, playback and reduced motion at desktop and phone widths. Run the typecheck and production build.
