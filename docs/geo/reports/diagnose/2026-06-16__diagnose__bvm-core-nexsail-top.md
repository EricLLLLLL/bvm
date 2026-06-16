# BVM GEO diagnosis - bvm-core.nexsail.top

Date: 2026-06-16

## Summary

BVM is already discoverable for exact and site-restricted queries, but weak for generic acronym queries such as `bvm` and partially weak for `bvm-core`. The main issue is not crawl failure. The issue is entity consolidation: Google sees stronger existing BVM entities, while the BVM Bun Version Manager evidence chain is still young and split across the official site, npm, GitHub, Libraries.io, and community posts.

## Verified facts

- `https://bvm-core.nexsail.top/` returns HTTP 200.
- `robots.txt` allows all crawlers and points to `https://bvm-core.nexsail.top/sitemap.xml`.
- `sitemap.xml` includes the homepage, about page, npm entry page, guide pages, troubleshooting pages, and zh alternates.
- GitHub repository `EricLLLLLL/bvm` is public, has homepage `https://bvm-core.nexsail.top`, and uses topics around Bun version management.
- npm package `bvm-core` is public, latest version is `1.1.39`, and its homepage points to `https://bvm-core.nexsail.top/from/npm`.
- Current search checks show exact/site queries can find the official website, npm profile/package signals, Libraries.io, GitHub profile/topic signals, and a Juejin post mentioning BVM.

## Inference

- Generic `bvm` is not a realistic short-term SEO target because it is an overloaded acronym with medical, school, organization, media, model, and business meanings.
- The short-term target should be entity binding for `BVM Bun Version Manager`, `bvm-core`, `Bun version manager`, `BVM for Bun`, and `npm bvm-core`.
- The official website should repeatedly and consistently state that BVM, Bun Version Manager, `bvm-core`, the `bvm` CLI command, `github.com/EricLLLLLL/bvm`, and `bvm-core.nexsail.top` refer to one project.

## Six-layer diagnosis

### Entity

Status: improved.

Actions shipped:

- Homepage title/description/tagline now mention `bvm-core`.
- About pages now define BVM as Bun Version Manager, state the npm package, CLI command, GitHub repository, and official website.
- About pages now include explicit same-name disambiguation.

### Knowledge

Status: improved.

Actions shipped:

- `/from/npm` and `/zh/from/npm` now explain that `bvm-core` installs the `bvm` CLI.
- English and Chinese pages include AI-citable summary blocks.

### Evidence

Status: partial.

Existing evidence:

- Official site
- GitHub repository
- npm package
- Libraries.io package mirror
- Juejin community post

Open gap:

- Need more external sources using the same wording: `BVM Bun Version Manager`, `bvm-core`, and `github.com/EricLLLLLL/bvm`.

### Structure

Status: improved.

Actions shipped:

- Added sitewide JSON-LD for `WebSite`, `SoftwareApplication`, and `SoftwareSourceCode`.
- `llms.txt` now starts with BVM entity summary before ecosystem promotion.
- Markdown mirrors and `llms-full.txt` were regenerated.

### Source Network

Status: partial.

GitHub and npm are aligned. Next source network targets should be GitHub README, npm README, Juejin, V2EX, and any release announcement pages.

### Feedback

Status: needs retest.

Retest queries:

- `bvm-core`
- `BVM Bun Version Manager`
- `bvm bun version manager`
- `npm bvm-core`
- `site:bvm-core.nexsail.top bvm-core`
- `github EricLLLLLL bvm`

## P0 actions

- Deploy the current website changes.
- Submit or re-submit `https://bvm-core.nexsail.top/sitemap.xml` in Google Search Console and Bing Webmaster Tools.
- Request indexing for `/`, `/about`, `/from/npm`, `/llms.txt`, and `/llms-full.txt`.

## P1 actions

- Update GitHub README and npm README so the first paragraph uses the same entity wording.
- Add a short `BVM vs other BVM meanings` section to README or docs if acronym confusion continues.
- Add one external explainer post titled around `BVM Bun Version Manager / bvm-core`.

## P2 actions

- Maintain a weekly visibility tracker for the retest queries.
- Add more third-party citations only when they describe the real project and link to the official site or GitHub repository.
