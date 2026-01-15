#!/bin/bash
set -e

# --- Configuration ---
DEFAULT_BVM_VERSION="v1.0.6"
FALLBACK_BUN_VERSION="1.3.5"
BVM_SRC_VERSION="${BVM_INSTALL_VERSION:-$DEFAULT_BVM_VERSION}"

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

# 0. Smart Registry Selection
REGISTRY="registry.npmjs.org"
if curl -s -m 2 https://registry.npmmirror.com > /dev/null; then
    REGISTRY="registry.npmmirror.com"
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
echo -e "${CYAN}${BOLD}BVM Installer${RESET} ${DIM}(${BVM_SRC_VERSION})${RESET}"
echo -e ""

# 1. Resolve BVM and Bun Versions
echo -n -e "${BLUE}ℹ${RESET} Resolving versions... "

# BVM Version (Fixed at release time)
# BVM_SRC_VERSION is already set via DEFAULT_BVM_VERSION or env

# Calculate Major version for Bun runtime
BVM_PLAIN_VER="${BVM_SRC_VERSION#v}"
BUN_MAJOR="${BVM_PLAIN_VER%%.*}"

# Resolve latest Bun matching that major version
BUN_LATEST=$(curl -s https://${REGISTRY}/-/package/bun/dist-tags | grep -oE '"latest":"[^"]+"' | cut -d'"' -f4 || echo "")
if [[ "$BUN_LATEST" == "$BUN_MAJOR."* ]]; then
    BUN_VER="$BUN_LATEST"
else
    # Emergency fallback
    BUN_VER="1.3.5"
fi

echo -e "${GREEN}Done${RESET}"

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
ln -sf "$TARGET_RUNTIME_DIR" "${BVM_RUNTIME_DIR}/current"

# 4. Download BVM Source
SRC_URL="https://cdn.jsdelivr.net/gh/EricLLLLLL/bvm@${BVM_SRC_VERSION}/dist/index.js"
download_file "$SRC_URL" "${BVM_SRC_DIR}/index.js" "Downloading BVM Source (${BVM_SRC_VERSION})..."

if [ ! -f "${BVM_SRC_DIR}/index.js" ]; then
    error "Failed to download BVM source."
fi

# 5. Create Wrapper
WRAPPER="${BVM_BIN_DIR}/bvm"
cat > "$WRAPPER" <<EOF
#!/bin/bash
export BVM_DIR="$BVM_DIR"
# Ensure we use the bundled runtime
exec "${BVM_RUNTIME_DIR}/current/bin/bun" "$BVM_SRC_DIR/index.js" "\$@"
EOF
chmod +x "$WRAPPER"

# 6. Initialize
if [ ! -f "${BVM_ALIAS_DIR}/default" ]; then
    mkdir -p "${BVM_DIR}/versions/v${BUN_VER}/bin"
    ln -sf "${TARGET_RUNTIME_DIR}/bin/bun" "${BVM_DIR}/versions/v${BUN_VER}/bin/bun"
    echo "v${BUN_VER}" > "${BVM_ALIAS_DIR}/default"
fi

# Run setup/rehash
# We capture the exit code to know if setup succeeded
if "$WRAPPER" setup --silent >/dev/null 2>&1; then
    SETUP_SUCCESS=true
else
    SETUP_SUCCESS=false
fi
"$WRAPPER" rehash --silent >/dev/null 2>&1 || true

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