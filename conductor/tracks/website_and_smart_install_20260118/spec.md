# Track Specification: BVM Official Website & Smart Install Script

## 1. Overview
Create a unified web presence for BVM using **Cloudflare Pages**. This project will serve two purposes:
1.  **Official Website**: A static landing page hosting documentation, usage guides, and introduction.
2.  **Smart Install Script**: A serverless function (Cloudflare Pages Functions) at `/install` that serves the correct installation script (Bash vs PowerShell) based on the user's User-Agent or query parameters, and dynamically selects the best registry mirror based on GeoIP.

## 2. Functional Requirements

### 2.1 Static Website
- **Framework**: Vite + React (or plain HTML/Astro for performance). Keep it lightweight.
- **Content**:
  - Hero section with the "One-Line Install" command.
  - Features overview (Speed, Isolation, etc.).
  - Documentation (from `README.md`).
- **Deployment**: `dist/` folder deployed to Cloudflare Pages.

### 2.2 Smart Install Endpoint (`/install`)
- **Route**: `https://<project>.pages.dev/install`
- **Logic**:
  - **User-Agent Detection**:
    - If `curl` or `wget` or `linux/mac` -> Return `install.sh`.
    - If `powershell` or `windows` -> Return `install.ps1`.
  - **GeoIP Detection**:
    - If `cf.country === 'CN'` -> Inject `registry.npmmirror.com` into the script.
    - Else -> Inject `registry.npmjs.org`.
  - **Version Injection**:
    - Dynamically inject the latest version number (read from `package.json` or a config file) into the script content before serving.

### 2.3 Installation Experience
- **Unix**: `curl -fsSL https://bvm-core.pages.dev/install | bash`
- **Windows**: `irm https://bvm-core.pages.dev/install | iex`

## 3. Technical Implementation
- **Repo Structure**: Create a `website/` directory in the root of the BVM repo.
- **Build Pipeline**:
  - CI (GitHub Actions) builds the website and deploys to Cloudflare Pages.
  - The `install.sh` and `install.ps1` files are copied from the project root to the website's public assets during build.

## 4. Acceptance Criteria
- [ ] Website is accessible at `https://bvm-core.pages.dev` (or similar).
- [ ] `/install` endpoint returns Bash script for `curl` requests.
- [ ] `/install` endpoint returns PowerShell script for `PowerShell` requests.
- [ ] (Optional) CN users get the mirror URL automatically injected.

## 5. Out of Scope
- Custom domain purchase (using `.pages.dev` for now).
- Complex backend API.
