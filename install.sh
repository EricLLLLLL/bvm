#!/bin/bash
set -e

# --- Configuration ---
DEFAULT_BVM_VERSION="v1.1.10" # Fallback
FALLBACK_BUN_VERSION="1.3.5"
BVM_SRC_VERSION="${BVM_INSTALL_VERSION}" # If empty, will resolve dynamically

# --- Colors (Matches src/utils/ui.ts) ---
if [ -t 1 ]; then
  RED="\033[1;31m"
  GREEN="\033[1;32m"
  YELLOW="\033[1;33m"
  BLUE="\033[1;34m"
  CYAN="\033[1;36m"
  GRAY="\033[90m"
  BOLD="\033[1m"
  DIM="\033[2m"
  RESET="\033[0m"
else
  RED="" GREEN="" YELLOW="" BLUE="" CYAN="" GRAY="" BOLD="" DIM="" RESET=""
fi

# --- Directories ---
BVM_DIR="${HOME}/.bvm"
BVM_SRC_DIR="${BVM_DIR}/src"
BVM_RUNTIME_DIR="${BVM_DIR}/runtime"
BVM_BIN_DIR="${BVM_DIR}/bin"
BVM_SHIMS_DIR="${BVM_DIR}/shims"
BVM_ALIAS_DIR="${BVM_DIR}/aliases"
TEMP_DIR=""

# --- Helpers ---
cleanup() {
  # Restore cursor just in case
  printf "\033[?25h"
  if [ -n "$TEMP_DIR" ] && [ -d "$TEMP_DIR" ]; then
    rm -rf "$TEMP_DIR"
  fi
}
trap cleanup EXIT

info() { echo -e "${BLUE}ℹ${RESET} $1"; }
success() { echo -e "${GREEN}✓${RESET} $1"; }
warn() { echo -e "${YELLOW}?${RESET} $1"; }
error() { echo -e "${RED}✖${RESET} $1"; exit 1; }

# Usage: download_file <url> <dest> <description>
download_file() {
    local url="$1"
    local dest="$2"
    local desc="$3"
    
    # Print description without newline
    echo -n -e "${BLUE}ℹ${RESET} $desc "
    
    # Start download in background (Silent but show errors, fail on error)
    curl -L -s -S -f "$url" -o "$dest" &
    local pid=$!
    
    local delay=0.1
    local spinstr='|/-\'
    
    # Hide cursor
    printf "\033[?25l"
    
    while kill -0 "$pid" 2>/dev/null; do
        local temp=${spinstr#?}
        printf "${CYAN}%c${RESET}" "$spinstr"
        local spinstr=$temp${spinstr%"$temp"}
        sleep $delay
        printf "\b"
    done
    
    # Restore cursor
    printf "\033[?25h"
    
    wait "$pid"
    local ret=$?
    
    if [ $ret -eq 0 ]; then
        echo -e "${GREEN}Done${RESET}"
    else
        echo -e "${RED}Failed${RESET}"
        return 1
    fi
}

# 0. Smart Network Detection (CN vs Global)
detect_network_zone() {
  if [ -n "$BVM_REGION" ]; then
    echo "$BVM_REGION"
    return
  fi

  # Test connectivity to unpkg vs elemecdn
  # We use a short timeout for the race
  if [ -n "$BVM_TEST_FORCE_CN" ]; then
    echo "cn"
  elif [ -n "$BVM_TEST_FORCE_GLOBAL" ]; then
    echo "global"
  elif curl -s -m 1.5 https://npm.elemecdn.com > /dev/null; then
    # Usually elemecdn is much faster in CN
    echo "cn"
  else
    echo "global"
  fi
}

detect_shell() {
  local shell_name=""
  
  # 1. Try to detect from parent process (PPID)
  # Check if ps supports -p and -o (POSIX-ish)
  if command -v ps >/dev/null 2>&1; then
     # Try standard POSIX syntax first
     local proc_name
     proc_name=$(ps -p "$PPID" -o comm= 2>/dev/null)
     if [ -n "$proc_name" ]; then
       shell_name="${proc_name##*/}"
     fi
  fi
  
  # Clean up shell name (remove leading hyphen for login shells)
  shell_name="${shell_name#-}"
  
  case "$shell_name" in
    *zsh) echo "zsh" ;;
    *bash) echo "bash" ;;
    *fish) echo "fish" ;;
    *)
      # 2. Fallback to SHELL environment variable
      if [ -n "$SHELL" ]; then
        echo "${SHELL##*/}"
      else
        echo "unknown"
      fi
      ;;
  esac
}

# --- Main Script ---

BVM_REGION=$(detect_network_zone)

if [ "$BVM_REGION" == "cn" ]; then
    REGISTRY="registry.npmmirror.com"
    NPM_CDN="https://npm.elemecdn.com"
else
    REGISTRY="registry.npmjs.org"
    NPM_CDN="https://unpkg.com"
fi

echo -e "${CYAN}"
echo -e "__________              "
echo -e "\\______   \\__  _______  "
echo -e " |    |  _|  \\/ /     \\ "
echo -e " |    |   \\\\   /  Y Y  \\ "
echo -e " |______  / \\_/|__|_|  / "
echo -e "        \\/           \\/ "
echo -e "${RESET}"
echo -e ""
echo -e "${CYAN}${BOLD}BVM Installer${RESET} ${DIM}(${BVM_REGION})${RESET}"
echo -e ""

# 1. Resolve BVM and Bun Versions
echo -n -e "${BLUE}ℹ${RESET} Resolving versions... "

# Resolve BVM Version dynamically if not provided
if [ -z "$BVM_SRC_VERSION" ]; then
    if [ -f "./dist/index.js" ] && [ -f "./package.json" ]; then
        # Use version from local package.json
        BVM_SRC_VERSION="v$(grep -oE '"version": "[^"]+"' package.json | cut -d'"' -f4 || echo "0.0.0")"
        info "Using local version from package.json: $BVM_SRC_VERSION"
    else
        BVM_LATEST=$(curl -s https://${REGISTRY}/bvm-core | grep -oE '"dist-tags":\{"latest":"[^"]+"\}' | cut -d'"' -f6 || echo "")
        if [ -n "$BVM_LATEST" ]; then
            BVM_SRC_VERSION="v$BVM_LATEST"
        else
            BVM_SRC_VERSION="$DEFAULT_BVM_VERSION"
        fi
    fi
fi

# Calculate Major version for Bun runtime
BVM_PLAIN_VER="${BVM_SRC_VERSION#v}"
BUN_MAJOR="${BVM_PLAIN_VER%%.*}"

# Resolve latest Bun matching that major version
if [ -n "$BVM_INSTALL_BUN_VERSION" ]; then
    BUN_VER="$BVM_INSTALL_BUN_VERSION"
else
    BUN_LATEST=$(curl -s https://${REGISTRY}/-/package/bun/dist-tags | grep -oE '"latest":"[^"]+"' | cut -d'"' -f4 || echo "")
    if [[ "$BUN_LATEST" == "$BUN_MAJOR."* ]]; then
        BUN_VER="$BUN_LATEST"
    else
        # Emergency fallback
        BUN_VER="$FALLBACK_BUN_VERSION"
    fi
fi

echo -e "${GREEN}${BVM_SRC_VERSION} (Bun v${BUN_VER})${RESET}"

# 2. Setup Directories
mkdir -p "$BVM_DIR" "$BVM_SRC_DIR" "$BVM_RUNTIME_DIR" "$BVM_BIN_DIR" "$BVM_SHIMS_DIR" "$BVM_ALIAS_DIR"

# 3. Download Runtime (if needed)
TARGET_RUNTIME_DIR="${BVM_RUNTIME_DIR}/v${BUN_VER}"
if [ -d "${TARGET_RUNTIME_DIR}/bin" ] && [ -x "${TARGET_RUNTIME_DIR}/bin/bun" ]; then
  success "Runtime (bun@${BUN_VER}) already installed."
else
  OS="$(uname -s | tr -d '"')"
  ARCH="$(uname -m | tr -d '"')"
  case "$OS" in 
    Linux) P="linux" ;; 
    Darwin) P="darwin" ;; 
    MINGW*|MSYS*|CYGWIN*) P="windows" ;;
    *) error "Unsupported OS: $OS" ;; 
  esac
  case "$ARCH" in 
    x86_64) A="x64" ;; 
    arm64|aarch64) A="aarch64" ;; 
    *) error "Unsupported Arch: $ARCH" ;; 
  esac
  
  if [ "$P" == "darwin" ]; then 
    PKG="@oven/bun-darwin-$A"
    EXE="bun"
  elif [ "$P" == "windows" ]; then
    PKG="@oven/bun-windows-$A"
    EXE="bun.exe"
  else 
    PKG="@oven/bun-linux-$A"
    EXE="bun"
  fi
  
  URL="https://${REGISTRY}/${PKG}/-/${PKG##*/}-${BUN_VER}.tgz"
  
  TEMP_DIR="$(mktemp -d)"
  TEMP_TGZ="${TEMP_DIR}/bun-runtime.tgz"
  
  download_file "$URL" "$TEMP_TGZ" "Downloading Runtime (bun@${BUN_VER})..."
  
  # Check if download succeeded
  if [ ! -f "$TEMP_TGZ" ] || [ ! -s "$TEMP_TGZ" ]; then
      error "Download failed or empty file."
  fi

  # Extract
  tar -xzf "$TEMP_TGZ" -C "$TEMP_DIR"
  
  # Move
  mkdir -p "${TARGET_RUNTIME_DIR}/bin"
  FOUND_BIN="$(find "$TEMP_DIR" -type f -name "$EXE" | head -n 1)"
  if [ -z "$FOUND_BIN" ]; then
    error "Could not find '$EXE' binary in downloaded archive."
  fi
  
  mv "$FOUND_BIN" "${TARGET_RUNTIME_DIR}/bin/bun"
  chmod +x "${TARGET_RUNTIME_DIR}/bin/bun"
  success "Runtime installed."
fi

# Link current runtime
rm -rf "${BVM_RUNTIME_DIR}/current"
ln -sf "$TARGET_RUNTIME_DIR" "${BVM_RUNTIME_DIR}/current"

# 4. Download BVM Source & Shim (Tarball Strategy)
# Use Registry Tarball to avoid CDN sync delays
if [ "$BVM_REGION" == "cn" ]; then
    TARBALL_URL="https://registry.npmmirror.com/bvm-core/-/bvm-core-${BVM_SRC_VERSION#v}.tgz"
else
    TARBALL_URL="https://registry.npmjs.org/bvm-core/-/bvm-core-${BVM_SRC_VERSION#v}.tgz"
fi

# Local fallback for development/testing
if [ -f "./dist/index.js" ]; then
    cp "./dist/index.js" "${BVM_SRC_DIR}/index.js"
    cp "./dist/bvm-shim.sh" "${BVM_BIN_DIR}/bvm-shim.sh"
    info "Using local BVM source from dist/."
else
    TEMP_TGZ="$(mktemp)"
    download_file "$TARBALL_URL" "$TEMP_TGZ" "Downloading BVM Source (${BVM_SRC_VERSION})..."
    
    # Extract specific files from tarball (strip components to handle 'package/' prefix)
    # The tarball structure is package/dist/index.js
    tar -xzf "$TEMP_TGZ" -C "$BVM_SRC_DIR" --strip-components=2 "package/dist/index.js"
    tar -xzf "$TEMP_TGZ" -C "$BVM_BIN_DIR" --strip-components=2 "package/dist/bvm-shim.sh"
    
    rm -f "$TEMP_TGZ"
fi

if [ ! -f "${BVM_SRC_DIR}/index.js" ] || [ ! -f "${BVM_BIN_DIR}/bvm-shim.sh" ]; then
    error "Failed to extract BVM source or shim from tarball."
fi
chmod +x "${BVM_BIN_DIR}/bvm-shim.sh"

# 5. Create Shims (Decoupled from index.js)
echo -n -e "${BLUE}ℹ${RESET} Initializing shims... "

# Create bvm wrapper
cat > "${BVM_BIN_DIR}/bvm" <<EOF
#!/bin/bash
export BVM_DIR="$BVM_DIR"
exec "${BVM_RUNTIME_DIR}/current/bin/bun" "$BVM_SRC_DIR/index.js" "\$@"
EOF
chmod +x "${BVM_BIN_DIR}/bvm"

# Create bun and bunx shims
for cmd in bun bunx; do
  cat > "${BVM_SHIMS_DIR}/${cmd}" <<EOF
#!/bin/bash
export BVM_DIR="$BVM_DIR"
exec "${BVM_BIN_DIR}/bvm-shim.sh" "$cmd" "\$@"
EOF
  chmod +x "${BVM_SHIMS_DIR}/${cmd}"
done

echo -e "${GREEN}Done${RESET}"

# 6. Initialize First Version
if [ ! -f "${BVM_ALIAS_DIR}/default" ]; then
    # Create the versions entry for the first download
    mkdir -p "${BVM_DIR}/versions/v${BUN_VER}/bin"
    ln -sf "${TARGET_RUNTIME_DIR}/bin/bun" "${BVM_DIR}/versions/v${BUN_VER}/bin/bun"
    # Set it as default
    echo "v${BUN_VER}" > "${BVM_ALIAS_DIR}/default"
fi

# We no longer need to run '$WRAPPER rehash' because we just did it manually/statically
SETUP_SUCCESS=true
if ! "${BVM_BIN_DIR}/bvm" setup --silent >/dev/null 2>&1; then
    SETUP_SUCCESS=false
fi

# 7. Final Instructions
echo ""
echo -e "${GREEN}${BOLD}🎉 BVM Installed Successfully!${RESET}"
echo ""

CURRENT_SHELL=$(detect_shell)
DISPLAY_PROFILE=""

case "$CURRENT_SHELL" in
  zsh) DISPLAY_PROFILE="$HOME/.zshrc" ;; 
  bash) 
    # Prefer .bashrc if it exists (common for users who manually set up their environment)
    if [ -f "$HOME/.bashrc" ]; then
      DISPLAY_PROFILE="$HOME/.bashrc"
    elif [ -f "$HOME/.bash_profile" ]; then 
      DISPLAY_PROFILE="$HOME/.bash_profile"
    else 
      DISPLAY_PROFILE="$HOME/.bashrc"
    fi 
    ;; 
  fish) DISPLAY_PROFILE="$HOME/.config/fish/config.fish" ;; 
  *) DISPLAY_PROFILE="$HOME/.profile" ;; 
esac

echo "To start using bvm:"
echo ""

if [ "$SETUP_SUCCESS" = true ]; then
    # If setup succeeded, we don't need to show the long echo command
    echo -e "  ${YELLOW}1. Refresh your shell:${RESET}"
    echo "     source $DISPLAY_PROFILE"
    
    echo ""
    echo -e "  ${YELLOW}2. Verify:${RESET}"
    echo -e "     bvm --version"
else
    # If setup failed for some reason, we fallback to manual instructions
    echo -e "  ${YELLOW}1. Add to config:${RESET}"
    echo "     echo 'export PATH=\"\$HOME/.bvm/bin:\$PATH\"' >> $DISPLAY_PROFILE"
    echo ""
    echo -e "  ${YELLOW}2. Refresh your shell:${RESET}"
    echo "     source $DISPLAY_PROFILE"
    
    echo ""
    echo -e "  ${YELLOW}3. Verify:${RESET}"
    echo -e "     bvm --version"
fi