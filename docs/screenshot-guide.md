# Re-capturing the README screenshots

The images in `docs/screenshots/` were captured against the seeded dataset. Because the seed is
deterministic, they stay accurate after a re-seed. Re-capture them if you change the UI, or if you
want the README to show your own live deployment.

## Before you start

```bash
npm run seed          # or npm run seed -- --reset
npm run verify:db     # confirm the graph is complete
npm run build
npm start             # single origin on http://localhost:5000
```

Use a **1440 × 900** viewport at **2× device pixel ratio** (in Chrome DevTools: Device Toolbar →
Responsive → 1440 × 900, DPR 2). Zoom must be 100%.

## The shots

| File | Route | What must be visible |
| --- | --- | --- |
| `01-home.png` | `/` | full page. Hero, the six live stat tiles with real counts, both graph paths |
| `02-developer-explorer.png` | `/developers` | search box, the result count line, at least 6 developer cards |
| `03-developer-profile.png` | `/developers/dev-003` | header with location/experience/counts, all 3 project cards with technologies, skills grouped by category, the two graph paths |
| `04-job-recommendations.png` | `/developers/dev-003` → **Find matching jobs** | the "Recommended jobs for Rohit Menon" heading, at least 4 cards showing a 100% match, a partial match, matched vs. missing skills, and a project-evidence block |
| `05-job-details.png` | `/jobs/job-033?developerId=dev-003` | 80% meter, required skills colour-coded green/amber, "Why this job matches", "Relevant project experience" with the multi-hop path |
| `06-database-unavailable.png` | `/developers` with the database stopped | the friendly outage state — no stack trace |
| `07-empty-search-state.png` | `/developers`, type `cobol` | the empty search state and "Clear search" |
| `08-responsive-mobile.png` | `/developers/dev-003` at 414 × 860 | full page, nothing clipped or overlapping |

`dev-003` (Rohit Menon) is a good subject: 7 skills, 3 projects, a 100% top match and several partial
matches, so one profile exercises the whole UI.

`job-033` (Full Stack Developer (Next.js) at LearnLoop) is a good job: for `dev-003` it is an 80%
match with exactly one missing skill, so both the matched and missing states are visible at once.

### Capturing the database-unavailable state

Point `COGNODB_URI` at a host that will not answer, then restart:

```bash
COGNODB_URI=bolt+s://unreachable.invalid npm start
```

Open `/developers`. Do **not** remove your real credentials from `.env` to do this, and check the
screenshot afterwards to be sure no host name or credential is legible.

## Before committing the images

- No real host names, credentials, tokens or personal data anywhere in the frame
- No browser extensions, bookmarks bar or personal tabs visible — use a clean window
- Numbers on the home page match the seeded counts (50 / 30 / 25 / 40 / 10 / 762)
- Each file is under about 1 MB

## For the screen recording

A 60–90 second pass through the whole journey, no narration required:

1. **Home** — pause on the live stat tiles, then on the two graph paths.
2. **Explore developers** — type a skill such as `Neo4j` into the search to show filtering.
3. Open **Rohit Menon** — scroll past the projects and the category-grouped skills.
4. Click **Find matching jobs** — let the loading state appear, then the results.
5. Point out one card: the percentage, the matched skills, the missing skill, the project evidence.
6. Click **View job** — show "Why this job matches" and "Relevant project experience".
7. Optionally end on `/api/health` in a tab, showing `"database": "connected"`.

Worth saying out loud once, if you narrate: the percentage is
`matched required skills ÷ total required skills`, and the project evidence comes from a four-hop
traversal, not from a scoring model.
