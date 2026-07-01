# BVM Google visibility gap diagnosis

Date: 2026-07-01

## Summary

The current problem is not a basic crawl outage. `https://bvm-core.nexsail.top/` returns HTTP 200 and `llms.txt` is reachable. The problem is a visibility gap between external evidence and the official site.

Google can already surface BVM-related external evidence such as Reddit, DEV, npm, Libraries.io, and Juejin for `bvm-core` / Bun Version Manager contexts. The official domain is still weak for broad and mid-tail queries such as:

- `bun version manager`
- `bvm`
- `bvm core`
- `bvm-core`

## Diagnosis

### Entity

Status: partial.

`BVM` is heavily overloaded. Search results for `bvm` and `bvm core` are dominated by unrelated medical, religious, school, company, and virtual machine meanings.

Short-term target:

- `BVM Bun Version Manager`
- `bvm-core`
- `bvm core bun`
- `bun version manager bvm`
- `AI coding agent Bun setup`

### Knowledge

Status: partial.

The site already has `About BVM`, `From NPM`, and `For AI Clients`, but it lacked exact-match pages for the terms users and AI agents actually search:

- `bun version manager`
- `bvm-core`
- comparisons among Bun version manager options

### Evidence

Status: improving, but official site is not leading yet.

Observed external evidence:

- Reddit post for BVM as a Bun Version Manager.
- DEV article about using BVM when Bun is missing in AI coding agents.
- npm search and profile evidence for `bvm-core`.
- Libraries.io package mirror for `bvm-core`.
- Juejin article linking the official website, GitHub, npm, and AI guide.

The external network is helping, but it mostly proves the package and article entities. The official website still needs stronger page-level relevance and internal links.

### Structure

Status: improved in this iteration.

Added pages:

- `/bun-version-manager`
- `/bvm-core`
- `/compare-bun-version-managers`

Updated generated assets:

- `llms.txt`
- `llms-full.txt`
- Markdown mirrors under `website/docs/public/`
- VitePress sitemap output

### Source network

Status: partial.

External posts should now link to the most specific official page instead of only the homepage:

- Use `https://bvm-core.nexsail.top/bun-version-manager` for `bun version manager`.
- Use `https://bvm-core.nexsail.top/bvm-core` for `bvm-core` and `bvm core`.
- Use `https://bvm-core.nexsail.top/compare-bun-version-managers` for comparison discussions.
- Use `https://bvm-core.nexsail.top/for-ai-clients` for AI coding agent setup rules.

### Feedback

Status: needs retest after deploy and index request.

Retest queries:

- `site:bvm-core.nexsail.top bun version manager`
- `site:bvm-core.nexsail.top bvm-core`
- `BVM Bun Version Manager`
- `bvm-core Bun Version Manager`
- `bun version manager bvm`
- `bun version manager AI coding agent`
- `bvm core bun`

## P0 actions

- Deploy the new docs pages and generated public assets.
- Submit the updated sitemap in Google Search Console and Bing Webmaster Tools.
- Request indexing for:
  - `https://bvm-core.nexsail.top/bun-version-manager`
  - `https://bvm-core.nexsail.top/bvm-core`
  - `https://bvm-core.nexsail.top/compare-bun-version-managers`
  - `https://bvm-core.nexsail.top/for-ai-clients`
  - `https://bvm-core.nexsail.top/llms.txt`

## P1 actions

- Edit previously published external posts to link to the new exact-match pages where relevant.
- Publish one English technical post titled around `BVM is a Bun Version Manager for AI coding agents`.
- Publish one comparison post titled around `BVM, BunVM, and Bum: Bun version manager options`.

## P2 actions

- Retest the query set weekly.
- Track whether Google first surfaces the official page, GitHub, npm, Reddit, DEV, or package mirrors.
- Add more external citations only when they use the canonical wording: `BVM`, `Bun Version Manager`, `bvm-core`, and `github.com/EricLLLLLL/bvm`.
