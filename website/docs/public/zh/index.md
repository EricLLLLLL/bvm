<div class="install-section">
  <h2>一键安装</h2>

  <div class="command-box recommended">
    <div class="header">
      <span class="os">macOS / Linux（推荐）</span>
      <span class="badge">Shell</span>
    </div>
    <div class="code-block">
      <code>{{ unixCommand }}</code>
      <button @click="copy(unixCommand, 'unix')" :class="{ copied: copied === 'unix' }">
        {{ copied === 'unix' ? '已复制' : '复制' }}
      </button>
    </div>
  </div>

  <div class="command-box recommended">
    <div class="header">
      <span class="os">Windows（推荐）</span>
      <span class="badge">PowerShell</span>
    </div>
    <div class="code-block">
      <code>{{ winCommand }}</code>
      <button @click="copy(winCommand, 'win')" :class="{ copied: copied === 'win' }">
        {{ copied === 'win' ? '已复制' : '复制' }}
      </button>
    </div>
  </div>

  <div class="command-box optional">
    <div class="header">
      <span class="os">NPM（可选）</span>
    </div>
    <div class="code-block">
      <code>{{ npmCommand }}</code>
      <button @click="copy(npmCommand, 'npm')" :class="{ copied: copied === 'npm' }">
        {{ copied === 'npm' ? '已复制' : '复制' }}
      </button>
    </div>
  </div>
</div>

<div class="compare-section">
  <h2>安装方式对比（怎么选）</h2>
  <table class="compare-table">
    <thead>
      <tr>
        <th>方式</th>
        <th>适合谁</th>
        <th>备注</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Shell</strong>（macOS/Linux）</td>
        <td>大多数用户</td>
        <td>自动竞速选最快源 + 自动 setup</td>
      </tr>
      <tr>
        <td><strong>PowerShell</strong>（Windows）</td>
        <td>Windows 开发</td>
        <td>与 Unix 安装体验一致</td>
      </tr>
      <tr>
        <td><strong>NPM</strong></td>
        <td>已在用 Node/NPM</td>
        <td>依赖 postinstall；可能需要重开终端</td>
      </tr>
    </tbody>
  </table>
</div>

<div class="callout-section">
  <div class="callout-card">
    <div class="callout-title">全局隔离不生效？</div>
    <div class="callout-body">如果命令仍来自 <code>~/.bun</code>，请运行一次 <code>bvm setup</code>，然后检查 <code>which bun</code> 是否命中 BVM shims。</div>
    <a class="callout-link" href="/zh/guide/troubleshooting">打开排障文档 →</a>
  </div>
</div>

<div class="demo-section">
  <h2>安装方式对比（动画）</h2>
  <video class="demo-video" controls playsinline preload="metadata" src="/media/bvm-install-methods.mp4"></video>
</div>
