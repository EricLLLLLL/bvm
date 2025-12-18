#!/bin/bash
set -e

# BVM Configuration
BVM_DIR="${HOME}/.bvm"
BVM_SRC_DIR="${BVM_DIR}/src"
BVM_RUNTIME_DIR="${BVM_DIR}/runtime"
BVM_BIN_DIR="${BVM_DIR}/bin"

# Colors & Styles
RED='\033[1;31m'      # Error (Bold Red)
GREEN='\033[1;32m'    # Success (Bold Green)
YELLOW='\033[1;33m'   # Warning (Bold Yellow)
BLUE='\033[1;34m'     # Info/Secondary (Bold Blue)
CYAN='\033[1;36m'     # Primary/Brand (Bold Cyan)
GRAY='\033[0;90m'     # Dim/Muted
BOLD='\033[1m'
NC='\033[0m' # No Color

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

# The Bun version that BVM itself runs on
if [ -n "$BVM_INSTALL_BUN_VERSION" ]; then
    REQUIRED_BUN_VERSION="$BVM_INSTALL_BUN_VERSION"
else
    FALLBACK_BUN_VERSION="1.3.5"
    REQUIRED_MAJOR_VERSION=$(echo "$FALLBACK_BUN_VERSION" | cut -d. -f1)
    
    printf "${CYAN}🔍 Resolving latest Bun version...${NC}"
    # Resolving via npm in background
    LATEST_VERSION=$(curl -s https://registry.npmjs.org/bun/latest | grep -oE '"version":"[^" ]+"' | cut -d'"' -f4)
    
    if [[ "$LATEST_VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
        LATEST_MAJOR=$(echo "$LATEST_VERSION" | cut -d. -f1)
        if [ "$LATEST_MAJOR" == "$REQUIRED_MAJOR_VERSION" ]; then
             REQUIRED_BUN_VERSION="$LATEST_VERSION"
             echo -e " ${GREEN}v${REQUIRED_BUN_VERSION}${NC}"
        else
             REQUIRED_BUN_VERSION="$FALLBACK_BUN_VERSION"
             echo -e " ${YELLOW}v${REQUIRED_BUN_VERSION} (fallback)${NC}"
        fi
    else
        REQUIRED_BUN_VERSION="$FALLBACK_BUN_VERSION"
        echo -e " ${YELLOW}v${REQUIRED_BUN_VERSION} (fallback)${NC}"
    fi
fi

# Logo
echo -e "${CYAN}${BOLD}"
cat << "EOF"
______________   _________   
\______   \   \ /   /     \  
 |    |  _|\   Y   /  \ /  \ 
 |    |   \ \     /    Y    \
 |______  /  \___/\____|__  /
        \/                \/ 
EOF
echo -e "${NC}"

echo -e "${CYAN}${BOLD}🚀 Installing BVM (Bun Version Manager)...${NC}"

# 1. Detect Platform
OS="$(uname -s)"
ARCH="$(uname -m)"

case "$OS" in
  Linux)
    PLATFORM="linux"
    ;;
  Darwin)
    PLATFORM="darwin"
    ;;
  *)
    echo -e "${RED}Unsupported OS: $OS${NC}"
    exit 1
    ;;
esac

case "$ARCH" in
  x86_64)
    BUN_ARCH="x64"
    ;;
  arm64|aarch64)
    BUN_ARCH="aarch64"
    ;;
  *)
    echo -e "${RED}Unsupported Architecture: $ARCH${NC}"
    exit 1
    ;;
esac

BUN_ASSET_NAME="bun-${PLATFORM}-${BUN_ARCH}"
if [ -z "$BUN_DOWNLOAD_URL" ]; then
  BUN_DOWNLOAD_URL="https://github.com/oven-sh/bun/releases/download/bun-v${REQUIRED_BUN_VERSION}/${BUN_ASSET_NAME}.zip"
fi

# 2. Setup Directories
mkdir -p "$BVM_DIR"
mkdir -p "$BVM_SRC_DIR"
mkdir -p "$BVM_RUNTIME_DIR"
mkdir -p "$BVM_BIN_DIR"

# 3. Install Private Bun Runtime
TARGET_RUNTIME_DIR="${BVM_RUNTIME_DIR}/v${REQUIRED_BUN_VERSION}"
LOCAL_VERSION_DIR="${BVM_DIR}/versions/v${REQUIRED_BUN_VERSION}"

if [ -f "${TARGET_RUNTIME_DIR}/bin/bun" ]; then
  echo -e "${GREEN}✅ BVM Runtime (Bun v${REQUIRED_BUN_VERSION}) already installed.${NC}"
elif [ -f "${LOCAL_VERSION_DIR}/bun" ]; then
  echo -e "${GREEN}♻️  Found Bun v${REQUIRED_BUN_VERSION} in versions. Copying to runtime...${NC}"
  rm -rf "$TARGET_RUNTIME_DIR"
  mkdir -p "$TARGET_RUNTIME_DIR/bin"
  cp "${LOCAL_VERSION_DIR}/bun" "$TARGET_RUNTIME_DIR/bin/bun"
  chmod +x "$TARGET_RUNTIME_DIR/bin/bun"
  echo -e "${GREEN}✅ BVM Runtime installed from local copy.${NC}"
else
  printf "${CYAN}📦 Downloading BVM Runtime (Bun v${REQUIRED_BUN_VERSION})...${NC}"
  TEMP_ZIP="${BVM_DIR}/bun-runtime.zip"
  curl -sL "$BUN_DOWNLOAD_URL" -o "$TEMP_ZIP" &
  spinner $!
  echo -e " ${GREEN}Done.${NC}"
  
  printf "${CYAN}📂 Extracting...${NC}"
  rm -rf "$TARGET_RUNTIME_DIR"
  unzip -q -o "$TEMP_ZIP" -d "$BVM_DIR" &
  spinner $!
  
  mv "${BVM_DIR}/${BUN_ASSET_NAME}" "$TARGET_RUNTIME_DIR"
  rm "$TEMP_ZIP"
  
  if [ -f "$TARGET_RUNTIME_DIR/bun" ] && [ ! -d "$TARGET_RUNTIME_DIR/bin" ]; then
      mkdir -p "$TARGET_RUNTIME_DIR/bin"
      mv "$TARGET_RUNTIME_DIR/bun" "$TARGET_RUNTIME_DIR/bin/bun"
  fi
  echo -e " ${GREEN}Done.${NC}"
fi

# Cleanup old runtime versions
echo -e "${BLUE}🗑️  Cleaning up old BVM Runtimes...${NC}"
find "$BVM_RUNTIME_DIR" -mindepth 1 -maxdepth 1 -type d -not -name "v$REQUIRED_BUN_VERSION" -exec rm -rf {} +

# Link 'current' runtime
rm -f "${BVM_RUNTIME_DIR}/current"
ln -s "$TARGET_RUNTIME_DIR" "${BVM_RUNTIME_DIR}/current"

# 4. Install BVM Source Code
if [ -f "dist/index.js" ]; then
    echo -e "${BLUE}📄 Installing BVM source from local dist/index.js...${NC}"
    cp "dist/index.js" "${BVM_SRC_DIR}/index.js"
else
    printf "${CYAN}⬇️  Downloading BVM source...${NC}"
    SOURCE_URL="https://github.com/EricLLLLLL/bvm/releases/latest/download/index.js"
    if [ -n "$BVM_SOURCE_URL" ]; then
        SOURCE_URL="$BVM_SOURCE_URL"
    fi
    curl -sL "$SOURCE_URL" -o "${BVM_SRC_DIR}/index.js" &
    spinner $!
    echo -e " ${GREEN}Done.${NC}"
fi

# 5. Create Wrapper Script
WRAPPER_PATH="${BVM_BIN_DIR}/bvm"
cat > "$WRAPPER_PATH" <<EOF
#!/bin/bash
export BVM_DIR="$BVM_DIR"
exec "${BVM_RUNTIME_DIR}/current/bin/bun" "${BVM_SRC_DIR}/index.js" "\$@"
EOF
chmod +x "$WRAPPER_PATH"

echo -e "${GREEN}${BOLD}🎉 BVM installed successfully!${NC}"

# 6. Auto-configure Shell
echo -e "${CYAN}⚙️  Configuring shell environment...${NC}"
"$WRAPPER_PATH" setup --silent

# 7. Optional: Set Runtime as Default Global Version
VERSIONS_DIR="${BVM_DIR}/versions"
DEFAULT_ALIAS_LINK="${BVM_DIR}/aliases/default"

if [ ! -f "$DEFAULT_ALIAS_LINK" ]; then
    echo -e "\n${CYAN}ℹ️  Setting Bun v${REQUIRED_BUN_VERSION} (runtime) as the default global version.${NC}"
    mkdir -p "${VERSIONS_DIR}/v${REQUIRED_BUN_VERSION}"
    cp "${TARGET_RUNTIME_DIR}/bin/bun" "${VERSIONS_DIR}/v${REQUIRED_BUN_VERSION}/bun"
    mkdir -p "${BVM_DIR}/aliases"
    echo "v${REQUIRED_BUN_VERSION}" > "${BVM_DIR}/aliases/default"
    "$WRAPPER_PATH" use default --silent
    echo -e "${GREEN}✓ Bun v${REQUIRED_BUN_VERSION} is now your default version.${NC}"
fi

# Detect shell for the final message
SHELL_NAME=$(basename "$SHELL")
case "$SHELL_NAME" in
  zsh)
    CONF_FILE="~/.zshrc"
    ;;
  bash)
    if [ "$PLATFORM" == "darwin" ]; then
      CONF_FILE="~/.bash_profile"
    else
      CONF_FILE="~/.bashrc"
    fi
    ;;
  fish)
    CONF_FILE="~/.config/fish/config.fish"
    ;;
  *)
    CONF_FILE="~/.bashrc"
    ;;
esac

echo -e "\n${BOLD}Next steps:${NC}"
echo -e "  1. To activate BVM, run:"
echo -e "     ${CYAN}source $CONF_FILE${NC}"
echo -e "  2. Run ${CYAN}bvm --help${NC} to get started."