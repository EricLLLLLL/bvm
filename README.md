# BVM (Bun Version Manager)

一个使用 Bun 编写的，轻量级、原生的 Bun 版本管理工具。

## 特性

*   ⚡️ **原生速度**: 使用 Bun 编写并编译为原生二进制文件，启动极快。
*   📦 **单文件**: 只有一个二进制文件，无依赖，即插即用。
*   🛠 **功能完整**: 支持 `install`, `use`, `ls`, `ls-remote`, `alias`, `run`, `exec` 等常用命令。
*   💻 **跨平台**: 支持 macOS 和 Linux (Windows 待定)。

## 安装

### 方式一：一键安装脚本 (推荐)

```bash
curl -fsSL https://raw.githubusercontent.com/bvm-cli/bvm/main/install.sh | bash
```

### 方式二：下载二进制文件

前往 [Releases](https://github.com/bvm-cli/bvm/releases) 页面下载对应你系统的版本。

下载后，添加执行权限并移动到 PATH 路径下：

```bash
chmod +x bvm
sudo mv bvm /usr/local/bin/
```

### 方式三：从源码编译

如果你已经安装了 Bun：

```bash
git clone https://github.com/bvm-cli/bvm.git
cd bvm
bun install
bun build src/index.ts --compile --outfile bvm
./bvm help
```

## 配置

首次运行后，你需要配置环境变量以便 `bvm` 生效。将以下内容添加到你的 Shell 配置文件 (`.bashrc`, `.zshrc`, `.profile` 等) 中：

```bash
# BVM Configuration
export BVM_DIR="$HOME/.bvm"
export PATH="$BVM_DIR/bin:$PATH"
```

## 使用指南

```bash
# 列出所有可用的远程版本
bvm ls-remote

# 安装特定版本
bvm install 1.0.0
bvm install latest

# 切换版本
bvm use 1.0.0

# 列出已安装版本
bvm ls

# 查看当前版本
bvm current

# 运行临时命令 (不切换全局版本)
bvm exec 1.1.0 bun run my-script.ts

# 卸载版本
bvm uninstall 1.0.0
```

## 贡献

欢迎提交 PR 和 Issue！

## License

MIT