# 规范说明书 (Spec): 优化源选择逻辑 (基于竞速策略与地理位置)

## 1. 概述 (Overview)
目前 BVM 使用时区判断 (`isChina`) 来决定使用哪个 NPM 注册表（Registry），这种方式不够精确，且无法反映真实的网络连接速度。本 Track 旨在实现一套更稳健的“智能竞速策略”，结合 Cloudflare 的地理位置检测，确保用户始终使用最快的镜像源进行下载。

## 2. 功能需求 (Functional Requirements)
- **地理位置精确探测**：
    - 尝试访问 `https://1.1.1.1/cdn-cgi/trace` 获取 `loc` 字段（国家代码）。
    - 配置 500ms 超时，若超时则直接跳过此步。
    - 如果 `loc=CN`，优先考虑国内镜像源。
- **实时竞速策略 (Race Strategy)**：
    - 在下载前，同时对以下备选源发起微小的 `HEAD` 请求：
        - `https://registry.npmjs.org` (官方)
        - `https://registry.npmmirror.com` (淘宝)
        - `https://mirrors.cloud.tencent.com/npm/` (腾讯)
    - 记录响应时间，选择延迟最低（最快返回）的源作为本次下载的 Registry。
- **智能缓存机制**：
    - 竞速结果在短时间内（如 1 小时内）有效，避免每次命令都重复竞速。
- **跨平台兼容性**：
    - 逻辑必须在 macOS、Linux 和 Windows (PowerShell/Bun) 上表现一致。
- **优雅退化**：
    - 如果 Cloudflare 探测失败，直接进入全源竞速模式。

## 3. 验收标准 (Acceptance Criteria)
- 执行 `bvm install` 时，系统能自动选择当前环境下最快的源，无需用户手动干预。
- 选择逻辑的耗时极低（HEAD 请求），不应明显拖慢命令启动速度。
- 能够准确识别身处中国但时区设置为 UTC 的开发者环境。
