<div class="install-section">
  <h2>One-Line Installation</h2>

  <div class="command-box recommended">
    <div class="header">
      <span class="os">macOS / Linux (Recommended)</span>
      <span class="badge">Universal</span>
    </div>
    <div class="code-block">
      <code>{{ unixCommand }}</code>
      <button @click="copy(unixCommand, 'unix')" :class="{ copied: copied === 'unix' }">
        {{ copied === 'unix' ? 'Copied!' : 'Copy' }}
      </button>
    </div>
  </div>

  <div class="command-box recommended">
    <div class="header">
      <span class="os">Windows (Recommended)</span>
      <span class="badge">PowerShell</span>
    </div>
    <div class="code-block">
      <code>{{ winCommand }}</code>
      <button @click="copy(winCommand, 'win')" :class="{ copied: copied === 'win' }">
        {{ copied === 'win' ? 'Copied!' : 'Copy' }}
      </button>
    </div>
  </div>

  <div class="command-box optional">
    <div class="header">
      <span class="os">NPM (Optional)</span>
    </div>
    <div class="code-block">
      <code>{{ npmCommand }}</code>
      <button @click="copy(npmCommand, 'npm')" :class="{ copied: copied === 'npm' }">
        {{ copied === 'npm' ? 'Copied!' : 'Copy' }}
      </button>
    </div>
  </div>
</div>

<div class="compare-section">
  <h2>Install methods (choose the best fit)</h2>
  <table class="compare-table">
    <thead>
      <tr>
        <th>Method</th>
        <th>Best for</th>
        <th>Notes</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Shell</strong> (macOS/Linux)</td>
        <td>Most users</td>
        <td>Fastest mirror + auto setup</td>
      </tr>
      <tr>
        <td><strong>PowerShell</strong> (Windows)</td>
        <td>Windows dev</td>
        <td>Same flow as Unix installer</td>
      </tr>
      <tr>
        <td><strong>NPM</strong></td>
        <td>Already using Node</td>
        <td>Runs postinstall; reopen terminal may be needed</td>
      </tr>
    </tbody>
  </table>
</div>

<div class="callout-section">
  <div class="callout-card">
    <div class="callout-title">Having trouble with global isolation?</div>
    <div class="callout-body">If tools still come from <code>~/.bun</code>, run <code>bvm setup</code> and verify <code>which bun</code> points to BVM shims.</div>
    <a class="callout-link" href="/guide/troubleshooting">Open Troubleshooting →</a>
  </div>
</div>

<div class="demo-section">
  <h2>Install methods (animated)</h2>
  <video class="demo-video" controls playsinline preload="metadata" src="/media/bvm-install-methods.mp4"></video>
</div>
