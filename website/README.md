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

## WeChat QR assets

Replace the placeholder QR codes used by:

- `website/docs/wechat.md`
- `website/docs/zh/wechat.md`

Assets:

- `website/docs/public/media/wechat-qrcode.svg`
- `website/docs/public/media/wechat-qrcode-npm.svg`

This project was created using `bun init` in bun v1.3.6. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
