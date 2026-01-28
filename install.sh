#!/bin/bash
# Unified Installation Logic: strict isolation, idempotency.
set -e

# --- Configuration ---
DEFAULT_BVM_VERSION="v1.1.36" # Fallback
FALLBACK_BUN_VERSION="1.3.6"
BVM_SRC_VERSION="${BVM_INSTALL_VERSION}" # If empty, will resolve dynamically

# --- Colors ---
if [ -t 1 ]; then
  RED="\033[1;31m" GREEN="\033[1;32m" YELLOW="\033[1;33m" BLUE="\033[1;34m"
  CYAN="\033[1;36m" GRAY="\033[90m" BOLD="\033[1m" DIM="\033[2m" RESET="\033[0m"
else
  RED="" GREEN="" YELLOW="" BLUE="" CYAN="" GRAY="" BOLD="" DIM="" RESET=""
fi

# --- Directories ---
BVM_DIR="${BVM_DIR:-${HOME}/.bvm}"
BVM_SRC_DIR="${BVM_DIR}/src"
BVM_RUNTIME_DIR="${BVM_DIR}/runtime"
BVM_BIN_DIR="${BVM_DIR}/bin"
BVM_SHIMS_DIR="${BVM_DIR}/shims"
BVM_ALIAS_DIR="${BVM_DIR}/aliases"
BVM_VERSIONS_DIR="${BVM_DIR}/versions"

# --- Helpers ---
info() { echo -e "${BLUE}ℹ${RESET} $1"; }
success() { echo -e "${GREEN}✓${RESET} $1"; }
warn() { echo -e "${YELLOW}?${RESET} $1"; }
error() { echo -e "${RED}✖${RESET} $1"; exit 1; }

download_file() {
    local url="$1" dest="$2" desc="$3"
    echo -n -e "${BLUE}ℹ${RESET} $desc "
    curl -L -s -S -f "$url" -o "$dest" &
    local pid=$!
    local delay=0.1
    local spinstr='|/-\'
    printf "\033[?25l"
    while kill -0 "$pid" 2>/dev/null; do
        local temp=${spinstr#?}
        printf "${CYAN}%c${RESET}" "$spinstr"
        local spinstr=$temp${spinstr%"$temp"}
        sleep $delay
        printf "\b"
    done
    printf "\033[?25h"
    wait "$pid"
    [ $? -eq 0 ] && echo -e "${GREEN}Done${RESET}" || (echo -e "${RED}Failed${RESET}"; return 1)
}

detect_network_zone() {
  [ -n "$BVM_REGION" ] && echo "$BVM_REGION" && return
  if [ -n "$BVM_TEST_FORCE_CN" ]; then echo "cn"
  elif [ -n "$BVM_TEST_FORCE_GLOBAL" ]; then echo "global"
  elif curl -s -m 1.5 https://npm.elemecdn.com > /dev/null; then echo "cn"
  else echo "global"
  fi
}

detect_shell() {
  local shell_name=""
  if command -v ps >/dev/null 2>&1; then
     local proc_name
     proc_name=$(ps -p "$PPID" -o comm= 2>/dev/null)
     [ -n "$proc_name" ] && shell_name="${proc_name##*/}"
  fi
  shell_name="${shell_name#-}"
  case "$shell_name" in
    *zsh) echo "zsh" ;;
    *bash) echo "bash" ;;
    *fish) echo "fish" ;;
    *) [ -n "$SHELL" ] && echo "${SHELL##*/}" || echo "unknown" ;;
  esac
}

# --- Checks ---
command -v curl >/dev/null || error "curl is required."
command -v tar >/dev/null || error "tar is required."

# --- Main Script ---
BVM_REGION=$(detect_network_zone)
if [ "$BVM_REGION" == "cn" ]; then
    REGISTRY="registry.npmmirror.com"
else
    REGISTRY="registry.npmjs.org"
fi

echo -e "${CYAN}__________              \n\______   \__  _______  \n |    |  _|  \/ /     \ \n |    |   \\   /  Y Y  \ \n |______  / \_/|__|_|  / \n        \/           \/ ${RESET}"
echo -e "${CYAN}${BOLD}BVM Installer${RESET} ${DIM}(${BVM_REGION})${RESET}
"

# 1. Self-Conflict Detection (Ensure consistent install source)
BVM_BIN_PATH="${BVM_BIN_DIR}/bvm"
if [ -f "$BVM_BIN_PATH" ]; then
    if grep -q 'BVM_INSTALL_SOURCE="npm"' "$BVM_BIN_PATH"; then
        error "BVM was installed via npm. Please use 'npm install -g bvm-core' or 'bvm upgrade' to upgrade."
    elif grep -q 'BVM_INSTALL_SOURCE="bun"' "$BVM_BIN_PATH"; then
        error "BVM was installed via bun. Please use 'bun install -g bvm-core' or 'bvm upgrade' to upgrade."
    fi
fi

# 2. Resolve BVM Version
echo -n -e "${BLUE}ℹ${RESET} Resolving versions... "
if [ -z "$BVM_SRC_VERSION" ]; then
    BVM_LATEST=$(curl -s https://${REGISTRY}/bvm-core | grep -oE '"dist-tags":\{"latest":"[^" ]+"\}' | cut -d'"' -f6 || echo "")
    BVM_SRC_VERSION="v${BVM_LATEST:-$DEFAULT_BVM_VERSION}"
fi
echo -e "${GREEN}${BVM_SRC_VERSION}${RESET}"

# 3. Setup Directories
mkdir -p "$BVM_DIR" "$BVM_SRC_DIR" "$BVM_RUNTIME_DIR" "$BVM_BIN_DIR" "$BVM_SHIMS_DIR" "$BVM_ALIAS_DIR" "$BVM_VERSIONS_DIR"

# 4. Download BVM Source
if [ "$BVM_REGION" == "cn" ]; then
    TARBALL_URL="https://registry.npmmirror.com/bvm-core/-/bvm-core-${BVM_SRC_VERSION#v}.tgz"
else
    TARBALL_URL="https://registry.npmjs.org/bvm-core/-/bvm-core-${BVM_SRC_VERSION#v}.tgz"
fi

if [ -f "./dist/index.js" ]; then
    cp "./dist/index.js" "${BVM_SRC_DIR}/index.js"
    cp "./dist/bvm-shim.sh" "${BVM_BIN_DIR}/bvm-shim.sh"
else
    TEMP_TGZ=$(mktemp)
    download_file "$TARBALL_URL" "$TEMP_TGZ" "Downloading BVM Source (${BVM_SRC_VERSION})..."
    tar -xzf "$TEMP_TGZ" -C "$BVM_SRC_DIR" --strip-components=2 "package/dist/index.js"
    tar -xzf "$TEMP_TGZ" -C "$BVM_BIN_DIR" --strip-components=2 "package/dist/bvm-shim.sh"
    rm -f "$TEMP_TGZ"
fi
chmod +x "${BVM_BIN_DIR}/bvm-shim.sh"

# 5. Bootstrapping Runtime (Using system bun if available, READ-ONLY)
SYSTEM_BUN_BIN=$(command -v bun || echo "")
# Guard: Do not use BVM's own shims as the bootstrap runtime
if [[ "$SYSTEM_BUN_BIN" == *".bvm/shims"* ]] || [[ "$SYSTEM_BUN_BIN" == *".bvm/bin"* ]]; then
    SYSTEM_BUN_BIN=""
fi
SYSTEM_BUN_VER=""
[ -n "$SYSTEM_BUN_BIN" ] && SYSTEM_BUN_VER=$(bun --version | sed 's/^v//')

USE_SYSTEM_AS_RUNTIME=false
BUN_VER=""

if [ -n "$SYSTEM_BUN_BIN" ]; then
    # We copy detected system bun to BVM internal versions for bootstrapping
    # We never modify the system installation.
    info "Bootstrapping with detected system Bun v${SYSTEM_BUN_VER}..."
    SYS_VER_DIR="${BVM_VERSIONS_DIR}/v${SYSTEM_BUN_VER}"
    mkdir -p "${SYS_VER_DIR}/bin"
    if [ "$SYSTEM_BUN_BIN" != "${SYS_VER_DIR}/bin/bun" ]; then
        cp "$SYSTEM_BUN_BIN" "${SYS_VER_DIR}/bin/bun"
    fi
    chmod +x "${SYS_VER_DIR}/bin/bun"
    
    # Smoke Test
    if "${SYS_VER_DIR}/bin/bun" "${BVM_SRC_DIR}/index.js" --version >/dev/null 2>&1; then
        success "Smoke Test passed."
        USE_SYSTEM_AS_RUNTIME=true
        BUN_VER="v${SYSTEM_BUN_VER}"
    else
        warn "Smoke Test failed. Will download fresh runtime."
    fi
fi

if [ "$USE_SYSTEM_AS_RUNTIME" = true ]; then
    TARGET_RUNTIME_DIR="${BVM_VERSIONS_DIR}/${BUN_VER}"
else
    # Resolve and download compatible runtime
    BUN_LATEST=$(curl -s https://${REGISTRY}/-/package/bun/dist-tags | grep -oE '"latest":"[^" ]+"' | cut -d'"' -f4 || echo "$FALLBACK_BUN_VERSION")
    BUN_VER="v${BUN_LATEST}"
    TARGET_RUNTIME_DIR="${BVM_VERSIONS_DIR}/${BUN_VER}"
    
    if [ ! -x "${TARGET_RUNTIME_DIR}/bin/bun" ]; then
        OS="$(uname -s | tr -d '"')"
        ARCH="$(uname -m | tr -d '"')"
        case "$OS" in Linux) P="linux" ;; Darwin) P="darwin" ;; *) error "Unsupported OS: $OS" ;; esac
        
        # macOS Architecture Guard: Handle Rosetta 2 emulation
        if [ "$OS" == "Darwin" ] && [ "$ARCH" == "x86_64" ]; then
            if [ "$(sysctl -n sysctl.proc_translated 2>/dev/null)" == "1" ]; then
                ARCH="arm64"
            fi
        fi

        case "$ARCH" in x86_64) A="x64" ;; arm64|aarch64) A="aarch64" ;; *) error "Unsupported Arch: $ARCH" ;; esac
        
        # Baseline check for x64
        SUFFIX=""
        if [ "$A" == "x64" ]; then
            if [ "$OS" == "Darwin" ]; then
                if ! sysctl -a 2>/dev/null | grep -q "AVX2"; then SUFFIX="-baseline"; fi
            elif [ "$OS" == "Linux" ]; then
                if ! grep -q "avx2" /proc/cpuinfo 2>/dev/null; then SUFFIX="-baseline"; fi
            fi
        fi

        PKG="@oven/bun-$P-$A"
        URL="https://${REGISTRY}/${PKG}/-/${PKG##*/}${SUFFIX}-${BUN_VER#v}.tgz"
        
        TEMP_DIR_BUN=$(mktemp -d)
        TEMP_TGZ_BUN="${TEMP_DIR_BUN}/bun-runtime.tgz"
        download_file "$URL" "$TEMP_TGZ_BUN" "Downloading Compatible Runtime (bun@${BUN_VER#v})..."
        tar -xzf "$TEMP_TGZ_BUN" -C "$TEMP_DIR_BUN"
        mkdir -p "${TARGET_RUNTIME_DIR}/bin"
        mv "$(find "$TEMP_DIR_BUN" -type f -name "bun" | head -n 1)" "${TARGET_RUNTIME_DIR}/bin/bun"
        chmod +x "${TARGET_RUNTIME_DIR}/bin/bun"
        rm -rf "$TEMP_DIR_BUN"
    fi
fi

# 6. Link Runtime
rm -rf "${BVM_RUNTIME_DIR}/current"
ln -sf "$TARGET_RUNTIME_DIR" "${BVM_RUNTIME_DIR}/current"

# Also link to ~/.bvm/current for user/shims compatibility
rm -rf "${BVM_DIR}/current"
ln -sf "$TARGET_RUNTIME_DIR" "${BVM_DIR}/current"

echo "$BUN_VER" > "${BVM_ALIAS_DIR}/default"

# 7. Create Shims & Wrappers
info "Initializing shims..."
cat > "${BVM_BIN_DIR}/bvm" <<EOF
#!/bin/bash
export BVM_DIR="$BVM_DIR"
exec "${BVM_RUNTIME_DIR}/current/bin/bun" "$BVM_SRC_DIR/index.js" "\$@"
EOF
chmod +x "${BVM_BIN_DIR}/bvm"

for cmd in bun bunx; do
  cat > "${BVM_SHIMS_DIR}/${cmd}" <<EOF
#!/bin/bash
export BVM_DIR="$BVM_DIR"
exec "${BVM_BIN_DIR}/bvm-shim.sh" "$cmd" "\$@"
EOF
  chmod +x "${BVM_SHIMS_DIR}/${cmd}"
done
success "Shims initialized."

# 8. Setup Environment (Self-Repair)
if ! "${BVM_BIN_DIR}/bvm" setup --silent >/dev/null 2>&1; then
    warn "Environment setup failed. You may need to manually add BVM to your PATH."
fi

# 9. Final Instructions
success "${BOLD}🎉 BVM Installed Successfully!${RESET}"
CURRENT_SHELL=$(detect_shell)
case "$CURRENT_SHELL" in
  zsh) DP="$HOME/.zshrc" ;;
  bash) DP="$([ -f "$HOME/.bashrc" ] && echo "$HOME/.bashrc" || echo "$HOME/.bash_profile")" ;; 
  fish) DP="$HOME/.config/fish/config.fish" ;; 
  *) DP="$HOME/.profile" ;; 
esac
echo -e "\nTo start using bvm:\n  ${YELLOW}1. Refresh your shell:${RESET}\n     source $DP\n\n  ${YELLOW}2. Verify:${RESET}\n     bvm --version\n\n  ${YELLOW}3. Note:${RESET}\n     Global packages (bun install -g) are isolated per version.\n     Ensure ~/.bvm/current/bin is in your PATH."