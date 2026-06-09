# Google / Bing 提交清单

目标站点：`https://bvm-core.nexsail.top`

## 已就绪

- `robots.txt`
  - 地址：`https://bvm-core.nexsail.top/robots.txt`
  - 当前已声明 sitemap
- `sitemap.xml`
  - 由 VitePress sitemap 生成
  - 基础域名来自 `website/docs/.vitepress/config.ts`
- Google 验证 meta
  - 环境变量：`BVM_GOOGLE_SITE_VERIFICATION`
  - 输出标签：`<meta name="google-site-verification" content="...">`
- Bing 验证 meta
  - 环境变量：`BVM_BING_SITE_VERIFICATION`
  - 输出标签：`<meta name="msvalidate.01" content="...">`

## 你需要提供

- Google Search Console 给出的 verification token
- Bing Webmaster Tools 给出的 verification token

## 部署前设置

在构建站点的环境变量里增加：

```bash
BVM_GOOGLE_SITE_VERIFICATION=你的_google_token
BVM_BING_SITE_VERIFICATION=你的_bing_token
```

## 提交步骤

### Google Search Console

1. 添加资源：`https://bvm-core.nexsail.top/`
2. 优先选择 `HTML 标记` 验证
3. 把 token 填到 `BVM_GOOGLE_SITE_VERIFICATION`
4. 部署后打开首页，确认存在：

```html
<meta name="google-site-verification" content="你的_token">
```

5. 点击验证
6. 提交 sitemap：`https://bvm-core.nexsail.top/sitemap.xml`

### Bing Webmaster Tools

1. 添加站点：`https://bvm-core.nexsail.top/`
2. 选择 `Meta tag` 验证
3. 把 token 填到 `BVM_BING_SITE_VERIFICATION`
4. 部署后打开首页，确认存在：

```html
<meta name="msvalidate.01" content="你的_token">
```

5. 点击验证
6. 提交 sitemap：`https://bvm-core.nexsail.top/sitemap.xml`

## 可选方案

如果你不想走 meta 验证，也可以改成根目录文件验证：

- Google：放平台给的 `google*.html` 到站点根目录
- Bing：放平台给的 `BingSiteAuth.xml` 到站点根目录

当前仓库更适合优先走 meta 验证，因为不需要为每次 token 变更新增文件。
