# website

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

## Analytics (optional)

This VitePress site supports optional Umami analytics injection at build time.

Set both env vars (and build in production) to enable:

- `BVM_UMAMI_SRC` (example: `https://umami.example.com/script.js`)
- `BVM_UMAMI_WEBSITE_ID` (example: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)

## Search verification

This VitePress site supports build-time search engine verification tags:

- `BVM_GOOGLE_SITE_VERIFICATION`
- `BVM_BING_SITE_VERIFICATION`

If `BVM_GOOGLE_SITE_VERIFICATION` is not set, the site falls back to the current production Google token in `website/docs/.vitepress/site.ts`.

## Build and deploy

Use this flow when you need to refresh the public site:

```bash
bun install
bun run build
```

Build output:

- `website/docs/.vitepress/dist`

Key files to verify before deployment:

- `website/docs/.vitepress/dist/index.html`
- `website/docs/.vitepress/dist/robots.txt`
- `website/docs/.vitepress/dist/sitemap.xml`

If the code is already pushed but `bvm-core.nexsail.top` still shows old content, the issue is in the external deploy step or CDN cache, not in VitePress source generation.

## WeChat QR assets

Replace the placeholder QR codes used by:

- `website/docs/wechat.md`
- `website/docs/zh/wechat.md`

Assets:

- `website/docs/public/media/wechat-qrcode.svg`
- `website/docs/public/media/wechat-qrcode-npm.svg`

This project was created using `bun init` in bun v1.3.6. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
