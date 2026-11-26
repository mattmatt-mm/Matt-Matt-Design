# Releases

Browse links to `/browse/releases`. The page uses the reading column, with the latest release first and a hairline between versions. The archived versions keep their original anchors.

Add one entry to `lib/releases.ts` in each visitor-facing PR. Increment the patch number and give the entry a date, a title, and a short description of what visitors can use. Link changes directly to their live pages. When a new component has a gesture worth showing, simulate it with a visible mouse gesture in the release grid. Each scene loops while visible and holds a still with reduced motion.

The page prerenders from the checked-in notes. The implementation and acceptance checks for the curated archive and StageShow simulations are in [Reliable dock navigation and curated releases](navigation-release-notes-plan.md).

The release grid uses the StageShow renderer in `components/releases/stageshow` under its MIT license. The scenes are authored in `components/releases/ReleaseScenes.tsx`.
