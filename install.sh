#!/bin/bash
set -e

# BVM Configuration
BVM_DIR="${HOME}/.bvm"
BVM_SRC_DIR="${BVM_DIR}/src"
BVM_RUNTIME_DIR="${BVM_DIR}/runtime"
BVM_BIN_DIR="${BVM_DIR}/bin"
BVM_SHIMS_DIR="${BVM_DIR}/shims"
BVM_ALIAS_DIR="${BVM_DIR}/aliases"

# Colors & Styles
RED='\033[1;31m'
GREEN='\033[1;32m'
YELLOW='\033[1;33m'
BLUE='\033[1;34m'
CYAN='\033[1;36m'
MAGENTA='\033[1;35m'
GRAY='\033[0;90m'
BOLD='\033[1m'
NC='\033[0m'

# Helper: Simple Spinner
spinner() {
    local pid=$1
    local delay=0.1
    local spinstr='|/-\'
    while [ "$(ps -p $pid -o state= 2>/dev/null)" ]; do
        local temp=${spinstr#?}
        printf " [%c]  " "$spinstr"
        local spinstr=$temp${spinstr%"$temp"}
        sleep $delay
        printf "\b\b\b\b\b\b"
    done
    printf "    \b\b\b\b"
}

# Version Resolution
if [ -n "$BVM_INSTALL_BUN_VERSION" ]; then
    REQUIRED_BUN_VERSION="$BVM_INSTALL_BUN_VERSION"
else
    FALLBACK_BUN_VERSION="1.3.5"
    REQUIRED_MAJOR_VERSION=$(echo "$FALLBACK_BUN_VERSION" | cut -d. -f1)
    printf "${GRAY}🔍 Resolving latest Bun v${REQUIRED_MAJOR_VERSION}.x version...${NC}"
    LATEST_COMPATIBLE_VERSION=$(curl -s https://registry.npmjs.org/bun | grep -oE '"[0-9]+\.[0-9]+\.[0-9]+":' | tr -d '"': | grep -E "^${REQUIRED_MAJOR_VERSION}\." | sort -V | tail -n 1)
    if [[ -n "$LATEST_COMPATIBLE_VERSION" ]]; then
            REQUIRED_BUN_VERSION="$LATEST_COMPATIBLE_VERSION"
            echo -e " ${BLUE}v${REQUIRED_BUN_VERSION}${NC}"
    else
            REQUIRED_BUN_VERSION="$FALLBACK_BUN_VERSION"
            echo -e " ${GRAY}v${REQUIRED_BUN_VERSION} (fallback)${NC}"
    fi
fi

# Optimization: Smart Runtime Reuse
if [ -d "$BVM_RUNTIME_DIR" ]; then
    EXISTING_RUNTIME=$(find "$BVM_RUNTIME_DIR" -mindepth 1 -maxdepth 1 -type d -name "v${REQUIRED_MAJOR_VERSION}.*" 2>/dev/null | sort -V | tail -n 1)
    if [ -n "$EXISTING_RUNTIME" ]; then
        EXISTING_VER=$(basename "$EXISTING_RUNTIME")
        REQUIRED_BUN_VERSION="${EXISTING_VER#v}"
        echo -e "${GREEN}♻️  Reusing existing compatible Runtime ${EXISTING_VER}${NC}"
    fi
fi

# Logo
echo -e "${MAGENTA}${BOLD}"
cat << "EOF"
______________   _________   
\______   \   \ /   /     \  
 |    |  _/   Y   /  \ /  \ 
 |    |   \ \     /    Y    \ 
 |______  /  \___/\____|__  / 
        \/                \/ 
EOF
echo -e "${NC}"
echo -e "${CYAN}${BOLD}🚀 Installing BVM (Bun Version Manager)...${NC}"

# 1. Detect Platform
OS="$(uname -s | tr -d '"')"
ARCH="$(uname -m | tr -d '"')"
case "$OS" in  Linux) PLATFORM="linux" ;;
  Darwin) PLATFORM="darwin" ;;
  *) echo -e "${RED}Unsupported OS: $OS${NC}"; exit 1 ;;
esac
case "$ARCH" in
  x86_64) BUN_ARCH="x64" ;;
  arm64|aarch64) BUN_ARCH="aarch64" ;;
  *) echo -e "${RED}Unsupported Architecture: $ARCH${NC}"; exit 1 ;;
esac

BUN_ASSET_NAME="bun-${PLATFORM}-${BUN_ARCH}"
BUN_DOWNLOAD_URL="https://github.com/oven-sh/bun/releases/download/bun-v${REQUIRED_BUN_VERSION}/${BUN_ASSET_NAME}.zip"

# 2. Setup Directories
mkdir -p "$BVM_DIR" "$BVM_SRC_DIR" "$BVM_RUNTIME_DIR" "$BVM_BIN_DIR" "$BVM_SHIMS_DIR" "$BVM_ALIAS_DIR"

# 3. Install Runtime
TARGET_RUNTIME_DIR="${BVM_RUNTIME_DIR}/v${REQUIRED_BUN_VERSION}"
if [ ! -f "${TARGET_RUNTIME_DIR}/bin/bun" ]; then
  printf "${BLUE}📦 Downloading BVM Runtime...${NC}"
  TEMP_ZIP="${BVM_DIR}/bun-runtime.zip"
  curl -sL "$BUN_DOWNLOAD_URL" -o "$TEMP_ZIP" &
  spinner $!
  unzip -q -o "$TEMP_ZIP" -d "$BVM_DIR" &
  spinner $!
  rm -rf "$TARGET_RUNTIME_DIR"
  mv "${BVM_DIR}/${BUN_ASSET_NAME}" "$TARGET_RUNTIME_DIR"
  if [ -f "$TARGET_RUNTIME_DIR/bun" ]; then
      mkdir -p "$TARGET_RUNTIME_DIR/bin"
      mv "$TARGET_RUNTIME_DIR/bun" "$TARGET_RUNTIME_DIR/bin/bun"
  fi
  rm "$TEMP_ZIP"
  echo -e " ${GREEN}Done.${NC}"
fi
ln -sf "$TARGET_RUNTIME_DIR" "${BVM_RUNTIME_DIR}/current"

# 4. Install Source
if [ -f "dist/index.js" ]; then
    cp "dist/index.js" "${BVM_SRC_DIR}/index.js"
else
    printf "${BLUE}⬇️  Downloading BVM source...${NC}"
    curl -sL "https://github.com/EricLLLLLL/bvm/releases/latest/download/index.js" -o "${BVM_SRC_DIR}/index.js" &
    spinner $!
    echo -e " ${GREEN}Done.${NC}"
fi

# 5. Create Wrapper
WRAPPER_PATH="${BVM_BIN_DIR}/bvm"
cat > "$WRAPPER_PATH" <<EOF
#!/bin/bash
export BVM_DIR="$BVM_DIR"
exec "${BVM_SHIMS_DIR}/bun" "$BVM_SRC_DIR/index.js" "\$@"
EOF
chmod +x "$WRAPPER_PATH"

# 6. Setup Shim
cat > "${BVM_SHIMS_DIR}/bun" << 'EOF'
#!/bin/bash
export BVM_DIR="${BVM_DIR:-$HOME/.bvm}"
COMMAND=$(basename "$0")
if [ -n "$BVM_ACTIVE_VERSION" ]; then
    VERSION="$BVM_ACTIVE_VERSION"
else
    CUR_DIR="$PWD"
    while [ "$CUR_DIR" != "/" ]; do
        if [ -f "$CUR_DIR/.bvmrc" ]; then
            VERSION="v$(cat "$CUR_DIR/.bvmrc" | tr -d 'v')"
            break
        fi
        CUR_DIR=$(dirname "$CUR_DIR")
    done
    # Global Current Symlink
    if [ -z "$VERSION" ] && [ -L "$BVM_DIR/current" ]; then
        VERSION_PATH=$(readlink "$BVM_DIR/current")
        VERSION_TMP=$(basename "$VERSION_PATH")
        if [ -d "$BVM_DIR/versions/$VERSION_TMP" ]; then
            VERSION="$VERSION_TMP"
        fi
    fi

    # Global Default Alias
    if [ -z "$VERSION" ]; then
        if [ -f "$BVM_DIR/aliases/default" ]; then
            VERSION=$(cat "$BVM_DIR/aliases/default")
        fi
    fi
fi

# 2. Validate
if [ -z "$VERSION" ]; then
    echo "BVM Error: No Bun version is active or default is set." >&2
    exit 1
fi
[[ "$VERSION" != v* ]] && VERSION="v$VERSION"

VERSION_DIR="$BVM_DIR/versions/$VERSION"
if [ ! -d "$VERSION_DIR" ]; then
    echo "BVM Error: Bun version $VERSION is not installed." >&2
    exit 1
fi

REAL_EXECUTABLE="$VERSION_DIR/bin/$COMMAND"

# 3. Execution
if [ -x "$REAL_EXECUTABLE" ]; then
    export BUN_INSTALL="$VERSION_DIR"
    export PATH="$VERSION_DIR/bin:$PATH"
    
    "$REAL_EXECUTABLE" "$@"
    EXIT_CODE=$?
    
    # Smart Hook: If this is 'bun' and it's a global command, auto-rehash
    if [[ "$COMMAND" == "bun" ]] && [[ "$*" == *"-g"* ]] && ([[ "$*" == *"install"* ]] || [[ "$*" == *"add"* ]] || [[ "$*" == *"remove"* ]] || [[ "$*" == *"uninstall"* ]]); then
        "$BVM_DIR/bin/bvm" rehash >/dev/null 2>&1
    fi
    
    exit $EXIT_CODE
else
    echo "BVM Error: Command '$COMMAND' not found in Bun $VERSION." >&2
    exit 127
fi
EOF
chmod +x "${BVM_SHIMS_DIR}/bun"
ln -sf bun "${BVM_SHIMS_DIR}/bunx"

# 7. Setup Default
if [ "$BVM_MODE" != "upgrade" ] && [ ! -f "${BVM_ALIAS_DIR}/default" ]; then
    VERSION_BIN_DIR="${BVM_DIR}/versions/v${REQUIRED_BUN_VERSION}/bin"
    mkdir -p "$VERSION_BIN_DIR"
    ln -sf "${TARGET_RUNTIME_DIR}/bin/bun" "${VERSION_BIN_DIR}/bun"
    echo "v${REQUIRED_BUN_VERSION}" > "${BVM_ALIAS_DIR}/default"
fi

# 8. Setup Shell
printf "${BLUE}⚙️  Configuring shell...${NC}"
"$WRAPPER_PATH" setup --silent &
spinner $!
echo -e " ${GREEN}Done.${NC}"

"$WRAPPER_PATH" rehash >/dev/null 2>&1

BVM_VERSION=$("$WRAPPER_PATH" --version 2>/dev/null || echo "unknown")
echo -e "\n${GREEN}${BOLD}🎉 BVM v${BVM_VERSION} installed successfully!${NC}"

# Detect shell
case "$(basename "$SHELL")" in
  zsh) CONF_FILE="${ZDOTDIR:-$HOME}/.zshrc" ;;
  bash) CONF_FILE="$([ "$(uname -s)" == "Darwin" ] && echo "$HOME/.bash_profile" || echo "$HOME/.bashrc")" ;;
  fish) CONF_FILE="${XDG_CONFIG_HOME:-$HOME/.config}/fish/config.fish" ;;
  *) CONF_FILE="$HOME/.bashrc" ;;
esac

echo -e "\n${BOLD}Next steps:${NC}\n  1. Run: ${YELLOW}${BOLD}source $CONF_FILE${NC}\n  2. Run 'bvm --help' to get started."
