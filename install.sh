#!/bin/bash
set -e

# BVM Configuration
BVM_DIR="${HOME}/.bvm"
BVM_SRC_DIR="${BVM_DIR}/src"
BVM_RUNTIME_DIR="${BVM_DIR}/runtime"
BVM_BIN_DIR="${BVM_DIR}/bin"
BVM_SHIMS_DIR="${BVM_DIR}/shims"
BVM_ALIAS_DIR="${BVM_DIR}/aliases"

# Colors
CYAN='\033[1;36m'
GRAY='\033[0;90m'
GREEN='\033[1;32m'
BOLD='\033[1m'
NC='\033[0m'

# BVM Style Progress Bar (Single Line)
# Usage: draw_bar <percentage> <label>
draw_bar() {
    local p=$1
    local label=$2
    local width=25
    local filled=$((p * width / 100))
    local empty=$((width - filled))
    
    local bar=""
    for ((i=0; i<filled; i++)); do bar="${bar}█"; done
    for ((i=0; i<empty; i++)); do bar="${bar}░"; done
    
    printf "\r ${CYAN}%s${GRAY}%s${NC} %3d%% | %s\033[K" "$bar" "${bar_empty:-░░░░░░░░░░░░░░░░░░░░░░░░░}" "$p" "$label"
}

# Fixed draw_bar for portability
draw_bar() {
    local p=$1
    local label=$2
    local width=20
    local filled=$((p * width / 100))
    local empty=$((width - filled))
    
    local filled_str=""
    for ((i=0; i<filled; i++)); do filled_str="${filled_str}█"; done
    local empty_str=""
    for ((i=0; i<empty; i++)); do empty_str="${empty_str}░"; done
    
    printf "\r %b%s%b%s%b %3d%% | %s\033[K" "$CYAN" "$filled_str" "$GRAY" "$empty_str" "$NC" "$p" "$label"
}

# Placeholder for build-time injection
BVM_EMBEDDED_VERSION=""
DEFAULT_BVM_VERSION="v1.0.6"

# --- 1. Resolution ---
draw_bar 5 "正在解析版本..."
FALLBACK_BUN_VERSION="1.3.5"
REQUIRED_MAJOR_VERSION=$(echo "$FALLBACK_BUN_VERSION" | cut -d. -f1)
LATEST_COMPATIBLE_VERSION=$(curl -s https://registry.npmjs.org/bun | grep -oE '"[0-9]+\.[0-9]+\.[0-9]+":' | tr -d '"': | grep -E "^${REQUIRED_MAJOR_VERSION}\." | sort -V | tail -n 1)
REQUIRED_BUN_VERSION="${LATEST_COMPATIBLE_VERSION:-$FALLBACK_BUN_VERSION}"

if [ -n "$BVM_INSTALL_VERSION" ]; then
    BVM_SRC_VERSION="$BVM_INSTALL_VERSION"
elif [ -n "$BVM_EMBEDDED_VERSION" ]; then
    BVM_SRC_VERSION="$BVM_EMBEDDED_VERSION"
else
    BVM_SRC_VERSION="$DEFAULT_BVM_VERSION"
fi

# --- 2. Setup ---
draw_bar 15 "正在准备目录..."
mkdir -p "$BVM_DIR" "$BVM_SRC_DIR" "$BVM_RUNTIME_DIR" "$BVM_BIN_DIR" "$BVM_SHIMS_DIR" "$BVM_ALIAS_DIR"

# --- 3. Runtime ---
TARGET_RUNTIME_DIR="${BVM_RUNTIME_DIR}/v${REQUIRED_BUN_VERSION}"
if [ ! -f "${TARGET_RUNTIME_DIR}/bin/bun" ]; then
  draw_bar 30 "正在下载 Bun Runtime..."
  TEMP_TGZ="${BVM_DIR}/bun-runtime.tgz"
  
  OS="$(uname -s | tr -d '"')"
  ARCH="$(uname -m | tr -d '"')"
  case "$OS" in  Linux) PLATFORM="linux" ;; Darwin) PLATFORM="darwin" ;; *) exit 1 ;; esac
  case "$ARCH" in x86_64) BUN_ARCH="x64" ;; arm64|aarch64) BUN_ARCH="aarch64" ;; *) exit 1 ;; esac
  
  if [ "$PLATFORM" == "darwin" ]; then NPM_PKG="@oven/bun-darwin-$BUN_ARCH"; else NPM_PKG="@oven/bun-linux-$BUN_ARCH"; fi
  URL="https://registry.npmjs.org/${NPM_PKG}/-/${NPM_PKG##*/}-${REQUIRED_BUN_VERSION}.tgz"
  MIRROR="https://registry.npmmirror.com/${NPM_PKG}/-/${NPM_PKG##*/}-${REQUIRED_BUN_VERSION}.tgz"

  if curl -sL --fail "$URL" -o "$TEMP_TGZ" || curl -sL --fail "$MIRROR" -o "$TEMP_TGZ"; then
      draw_bar 50 "正在解压 Runtime..."
      TEMP_EXTRACT_DIR="${BVM_DIR}/temp_extract"
      mkdir -p "$TEMP_EXTRACT_DIR"
      tar -xzf "$TEMP_TGZ" -C "$TEMP_EXTRACT_DIR"
      mkdir -p "$TARGET_RUNTIME_DIR/bin"
      mv "$(find "$TEMP_EXTRACT_DIR" -type f -name "bun" | head -n 1)" "$TARGET_RUNTIME_DIR/bin/bun"
      chmod +x "$TARGET_RUNTIME_DIR/bin/bun"
      rm -rf "$TEMP_EXTRACT_DIR" "$TEMP_TGZ"
  else
      echo -e "\n错误: 无法下载 Bun Runtime"; exit 1
  fi
fi
ln -sf "$TARGET_RUNTIME_DIR" "${BVM_RUNTIME_DIR}/current"

# --- 4. BVM Source ---
draw_bar 70 "正在下载 BVM 核心..."
SRC_URL="https://cdn.jsdelivr.net/gh/EricLLLLLL/bvm@${BVM_SRC_VERSION}/dist/index.js"
if curl -sL --fail "$SRC_URL" -o "${BVM_SRC_DIR}/index.js"; then
    :
else
    echo -e "\n错误: 无法下载 BVM 核心"; exit 1
fi

# --- 5. Finalize ---
draw_bar 90 "正在配置环境..."
WRAPPER_PATH="${BVM_BIN_DIR}/bvm"
cat > "$WRAPPER_PATH" <<EOF
#!/bin/bash
export BVM_DIR="$BVM_DIR"
exec "${BVM_RUNTIME_DIR}/current/bin/bun" "$BVM_SRC_DIR/index.js" "\$@"
EOF
chmod +x "$WRAPPER_PATH"

if [ ! -f "${BVM_ALIAS_DIR}/default" ]; then
    mkdir -p "${BVM_DIR}/versions/v${REQUIRED_BUN_VERSION}/bin"
    ln -sf "${TARGET_RUNTIME_DIR}/bin/bun" "${BVM_DIR}/versions/v${REQUIRED_BUN_VERSION}/bin/bun"
    echo "v${REQUIRED_BUN_VERSION}" > "${BVM_ALIAS_DIR}/default"
fi

"$WRAPPER_PATH" setup --silent >/dev/null 2>&1
"$WRAPPER_PATH" rehash >/dev/null 2>&1
draw_bar 100 "安装完成!"
echo -e "\n"

# Logo
echo -e "${CYAN}${BOLD}🚀 BVM v${BVM_SRC_VERSION} 安装成功！${NC}"
cat << "EOF"
______________   _________   
\______   \   \ /   /     \  
 |    |  _/   Y   /  \ /  \ 
 |    |   \ \     /    Y    \ 
 |______  /  \___/\____|__  / 
        \/                \/ 
EOF
echo ""
echo -e "请执行以下命令开始使用："
echo -e "  ${BOLD}source ~/.zshrc${NC} (或对应的配置文件)"
echo -e "  ${BOLD}bvm --help${NC}"