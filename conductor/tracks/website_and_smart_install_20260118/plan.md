# Implementation Plan - Website & Smart Install

## Phase 1: Project Skeleton & Configuration
- [x] Task: Create `website/` directory.
- [x] Task: Initialize a lightweight static site (Vite + React/Vue or Astro).
- [x] Task: Configure `wrangler.toml` (Cloudflare configuration) or Pages config.
- [x] Task: Conductor - User Manual Verification 'Skeleton Setup' (Protocol in workflow.md)

## Phase 2: Smart Install Function
- [x] Task: Create Cloudflare Pages Function `website/functions/install.ts`.
- [x] Task: Implement User-Agent detection logic.
- [x] Task: Implement GeoIP detection logic (using `request.cf.country`).
- [x] Task: Implement script injection (reading local `install.sh/ps1` and replacing variables).
- [x] Task: Conductor - User Manual Verification 'Smart Function' (Protocol in workflow.md)

## Phase 3: Website Content & Design
- [x] Task: Design and implement the Landing Page (Hero, Install Command, Features).
- [x] Task: Integrate `README.md` content (optional, or just link to repo).
- [x] Task: Ensure responsive design (Mobile/Desktop).
- [x] Task: Conductor - User Manual Verification 'Content' (Protocol in workflow.md)

## Phase 4: Deployment Pipeline
- [x] Task: Create `.github/workflows/deploy-website.yml`.
- [ ] Task: Configure Cloudflare Pages GitHub integration (or use Wrangler action).
- [ ] Task: Conductor - User Manual Verification 'Deployment' (Protocol in workflow.md)
