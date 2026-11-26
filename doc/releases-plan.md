# Releases

Browse links to the static Releases page at `/browse/releases`. Each version
has a date and a link to its GitHub pull request or commit. The page uses the
reading column, a hairline between entries, and the shared 4px squircle for
branch labels.

## Versioning

- Backfill the 13 merged pull requests as v0.1.1 through v0.1.13. The archive
  records each verified branch, merge SHA, and a summary of the change.
- During a production build, read the first-parent history from the build's
  commit to the archived checkpoint. Assign one successive patch number to
  each integrated revision. This gives rebuilds of the same commit the same
  version and groups a merge's branch commits into one entry.
- For GitHub merge and squash commits, link to the recorded pull request.
  Direct commits link to their revision. Preview builds can show releases
  already present on `origin/main`.
- On a shallow production checkout, fetch the pinned commit's public history
  into a temporary repository. The Releases page is generated at build time.
  When the build cannot retrieve the history, the page displays the verified
  archive and identifies that state.
