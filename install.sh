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

# Placeholder for build-time injection. 
# GitHub Actions will replace this line with the actual release tag.
BVM_EMBEDDED_VERSION=""

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

# Determine NPM Package Name
if [ "$PLATFORM" == "darwin" ] && [ "$BUN_ARCH" == "aarch64" ]; then
    NPM_PKG="@oven/bun-darwin-aarch64"
elif [ "$PLATFORM" == "darwin" ] && [ "$BUN_ARCH" == "x64" ]; then
    NPM_PKG="@oven/bun-darwin-x64"
elif [ "$PLATFORM" == "linux" ] && [ "$BUN_ARCH" == "aarch64" ]; then
    NPM_PKG="@oven/bun-linux-aarch64"
elif [ "$PLATFORM" == "linux" ] && [ "$BUN_ARCH" == "x64" ]; then
    NPM_PKG="@oven/bun-linux-x64"
else
    # Fallback/Windows (script mostly for unix though)
    NPM_PKG="bun" # Unlikely to work with this logic but safe fallback
fi

# NPM Tarball URL Construction
# Format: https://registry.npmjs.org/@oven/bun-darwin-aarch64/-/bun-darwin-aarch64-1.1.20.tgz
TARBALL_NAME="${NPM_PKG##*/}-${REQUIRED_BUN_VERSION}.tgz"

# Priority: 1. NPM Registry (Fastly/Cloudflare) 2. NPM Mirror (Aliyun)
URL_NPM="https://registry.npmjs.org/${NPM_PKG}/-/${TARBALL_NAME}"
URL_MIRROR="https://registry.npmmirror.com/${NPM_PKG}/-/${TARBALL_NAME}"

# 2. Setup Directories
mkdir -p "$BVM_DIR" "$BVM_SRC_DIR" "$BVM_RUNTIME_DIR" "$BVM_BIN_DIR" "$BVM_SHIMS_DIR" "$BVM_ALIAS_DIR"

# 3. Install Runtime
TARGET_RUNTIME_DIR="${BVM_RUNTIME_DIR}/v${REQUIRED_BUN_VERSION}"
if [ ! -f "${TARGET_RUNTIME_DIR}/bin/bun" ]; then
  printf "${BLUE}📦 Downloading BVM Runtime (v${REQUIRED_BUN_VERSION})...${NC}"
  TEMP_TGZ="${BVM_DIR}/bun-runtime.tgz"
  
  # Try NPM Registry first
  if curl -sL --fail "$URL_NPM" -o "$TEMP_TGZ"; then
      echo -e " ${GREEN}Downloaded from NPM.${NC}"
  else
      echo -e " ${YELLOW}NPM failed, trying Mirror...${NC}"
      # Try Mirror
      if curl -sL --fail "$URL_MIRROR" -o "$TEMP_TGZ"; then
          echo -e " ${GREEN}Downloaded from Mirror.${NC}"
      else
          echo -e " ${RED}Failed to download Bun runtime from both NPM and Mirror.${NC}"
          rm -f "$TEMP_TGZ"
          exit 1
      fi
  fi

  # Extract TGZ
  # Structure is usually package/bin/bun
  printf "${BLUE}🔓 Extracting...${NC}"
  TEMP_EXTRACT_DIR="${BVM_DIR}/temp_extract"
  mkdir -p "$TEMP_EXTRACT_DIR"
  tar -xzf "$TEMP_TGZ" -C "$TEMP_EXTRACT_DIR"
  
  rm -rf "$TARGET_RUNTIME_DIR"
  mkdir -p "$TARGET_RUNTIME_DIR/bin"
  
  # Find bun binary
  FOUND_BUN=$(find "$TEMP_EXTRACT_DIR" -type f -name "bun" | head -n 1)
  if [ -n "$FOUND_BUN" ]; then
      mv "$FOUND_BUN" "$TARGET_RUNTIME_DIR/bin/bun"
      chmod +x "$TARGET_RUNTIME_DIR/bin/bun"
  else
      echo -e " ${RED}Extraction failed: 'bun' binary not found in archive.${NC}"
      rm -rf "$TEMP_EXTRACT_DIR" "$TEMP_TGZ"
      exit 1
  fi
  
  rm -rf "$TEMP_EXTRACT_DIR" "$TEMP_TGZ"
  echo -e " ${GREEN}Done.${NC}"
fi
ln -sf "$TARGET_RUNTIME_DIR" "${BVM_RUNTIME_DIR}/current"

# 4. Install Source
if [ -f "dist/index.js" ]; then
    cp "dist/index.js" "${BVM_SRC_DIR}/index.js"
else
    printf "${BLUE}⬇️  Downloading BVM source...${NC}"
    
    # Determine BVM Version to download
    if [ -n "$BVM_INSTALL_VERSION" ]; then
        BVM_SRC_VERSION="$BVM_INSTALL_VERSION"
    elif [ -n "$BVM_EMBEDDED_VERSION" ]; then
        # Use the hardcoded version from the release tag
        BVM_SRC_VERSION="$BVM_EMBEDDED_VERSION"
    else
        # Default to 'main' is BAD because dist/index.js only exists on Release Tags.
        # We must resolve the latest release tag dynamically.
        printf "${GRAY}🔍 Resolving latest BVM version...${NC}"
        # Try fetching from GitHub API (fastest/reliable)
        LATEST_TAG=$(curl -s https://api.github.com/repos/EricLLLLLL/bvm/releases/latest | grep '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/')
        
        if [ -z "$LATEST_TAG" ]; then
             # Fallback to a hardcoded stable version if API fails (main branch has no dist)
             FALLBACK_VER="v1.0.2"
             echo -e " ${YELLOW}Failed to resolve latest version via API, falling back to '${FALLBACK_VER}'.${NC}"
             BVM_SRC_VERSION="$FALLBACK_VER"
        else
             BVM_SRC_VERSION="$LATEST_TAG"
             echo -e " ${BLUE}${BVM_SRC_VERSION}${NC}"
        fi
    fi
    
    # Use jsDelivr CDN for better global speed
    # Format: https://cdn.jsdelivr.net/gh/EricLLLLLL/bvm@<version>/dist/index.js
    SRC_URL="https://cdn.jsdelivr.net/gh/EricLLLLLL/bvm@${BVM_SRC_VERSION}/dist/index.js"
    
    # Debug info (only if something goes wrong, or user wants verbose)
    # echo "Downloading from: $SRC_URL"
    
    if curl -sL --fail "$SRC_URL" -o "${BVM_SRC_DIR}/index.js"; then
        echo -e " ${GREEN}Done.${NC}"
    else
        echo -e " ${RED}Failed to download BVM source from CDN.${NC}"
        echo -e " ${YELLOW}URL: ${SRC_URL}${NC}"
        exit 1
    fi
fi

# 5. Create Wrapper
WRAPPER_PATH="${BVM_BIN_DIR}/bvm"
cat > "$WRAPPER_PATH" <<EOF
#!/bin/bash
export BVM_DIR="$BVM_DIR"
exec "${BVM_RUNTIME_DIR}/current/bin/bun" "$BVM_SRC_DIR/index.js" "\$@"
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
