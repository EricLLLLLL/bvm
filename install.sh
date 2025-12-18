#!/bin/bash
set -e

# BVM Configuration
BVM_DIR="${HOME}/.bvm"
BVM_SRC_DIR="${BVM_DIR}/src"
BVM_RUNTIME_DIR="${BVM_DIR}/runtime"
BVM_BIN_DIR="${BVM_DIR}/bin"

# Colors & Styles
RED='\033[1;31m'      # Error
GREEN='\033[1;32m'    # Success
YELLOW='\033[1;33m'   # Action / Warning
BLUE='\033[1;34m'     # Process / Task
CYAN='\033[1;36m'     # Primary / Brand
MAGENTA='\033[1;35m'  # Bun Brand Color
GRAY='\033[0;90m'     # Info / Secondary
BOLD='\033[1m'
NC='\033[0m' # No Color

# ... (omitted)

# Logo
echo -e "${MAGENTA}${BOLD}"
cat << "EOF"
______________   _________   
\______   \   \ /   /     \  
 |    |  _/\   Y   /  \ /  \ 
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
  Linux) PLATFORM="linux" ;; 
  Darwin) PLATFORM="darwin" ;; 
  *) echo -e "${RED}Unsupported OS: $OS${NC}"; exit 1 ;; 
esac

case "$ARCH" in
  x86_64) BUN_ARCH="x64" ;; 
  arm64|aarch64) BUN_ARCH="aarch64" ;; 
  *) echo -e "${RED}Unsupported Architecture: $ARCH${NC}"; exit 1 ;; 
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
  echo -e "${GRAY}✅ BVM Runtime (Bun v${REQUIRED_BUN_VERSION}) already installed.${NC}"
elif [ -f "${LOCAL_VERSION_DIR}/bun" ]; then
  echo -e "${BLUE}♻️  Found Bun v${REQUIRED_BUN_VERSION} in versions. Copying to runtime...${NC}"
  rm -rf "$TARGET_RUNTIME_DIR"
  mkdir -p "$TARGET_RUNTIME_DIR/bin"
  cp "${LOCAL_VERSION_DIR}/bun" "$TARGET_RUNTIME_DIR/bin/bun"
  chmod +x "$TARGET_RUNTIME_DIR/bin/bun"
  echo -e "${GREEN}✅ BVM Runtime installed from local copy.${NC}"
else
  printf "${BLUE}📦 Downloading BVM Runtime (Bun v${REQUIRED_BUN_VERSION})...${NC}"
  TEMP_ZIP="${BVM_DIR}/bun-runtime.zip"
  curl -sL "$BUN_DOWNLOAD_URL" -o "$TEMP_ZIP" &
  spinner $!
  echo -e " ${GREEN}Done.${NC}"
  
  printf "${BLUE}📂 Extracting...${NC}"
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

# Cleanup
find "$BVM_RUNTIME_DIR" -mindepth 1 -maxdepth 1 -type d -not -name "v$REQUIRED_BUN_VERSION" -exec rm -rf {} +
rm -f "${BVM_RUNTIME_DIR}/current"
ln -s "$TARGET_RUNTIME_DIR" "${BVM_RUNTIME_DIR}/current"

# 4. Install BVM Source Code
if [ -f "dist/index.js" ]; then
    echo -e "${GRAY}📄 Using local BVM source from dist/index.js...${NC}"
    cp "dist/index.js" "${BVM_SRC_DIR}/index.js"
else
    printf "${BLUE}⬇️  Downloading BVM source...${NC}"
    SOURCE_URL="https://github.com/EricLLLLLL/bvm/releases/latest/download/index.js"
    if [ -n "$BVM_SOURCE_URL" ]; then SOURCE_URL="$BVM_SOURCE_URL"; fi
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

# 6. Auto-configure Shell
printf "${BLUE}⚙️  Configuring shell environment...${NC}"
"$WRAPPER_PATH" setup --silent &
spinner $!
echo -e " ${GREEN}Done.${NC}"

# 7. Optional: Set Runtime as Default Global Version
VERSIONS_DIR="${BVM_DIR}/versions"
DEFAULT_ALIAS_LINK="${BVM_DIR}/aliases/default"

if [ ! -f "$DEFAULT_ALIAS_LINK" ]; then
    echo -e "\n${BLUE}ℹ️  Setting Bun v${REQUIRED_BUN_VERSION} as the default global version.${NC}"
    mkdir -p "${VERSIONS_DIR}/v${REQUIRED_BUN_VERSION}"
    cp "${TARGET_RUNTIME_DIR}/bin/bun" "${VERSIONS_DIR}/v${REQUIRED_BUN_VERSION}/bun"
    mkdir -p "${BVM_DIR}/aliases"
    echo "v${REQUIRED_BUN_VERSION}" > "${BVM_DIR}/aliases/default"
    "$WRAPPER_PATH" use default --silent
    echo -e "${GREEN}✓ Bun v${REQUIRED_BUN_VERSION} is now your default version.${NC}"
fi

echo -e "\n${GREEN}${BOLD}🎉 BVM installed successfully!${NC}"

# Detect shell for the final message
SHELL_NAME=$(basename "$SHELL")
case "$SHELL_NAME" in
  zsh) CONF_FILE="${ZDOTDIR:-$HOME}/.zshrc" ;;
  bash) CONF_FILE="$([ "$OS" == "Darwin" ] && echo "$HOME/.bash_profile" || echo "$HOME/.bashrc")" ;;
  fish) CONF_FILE="${XDG_CONFIG_HOME:-$HOME/.config}/fish/config.fish" ;;
  *) CONF_FILE="$HOME/.bashrc" ;;
esac
echo -e "\n${BOLD}Next steps:${NC}"
echo -e "  1. To activate BVM, run:"
echo -e "     ${YELLOW}${BOLD}source $CONF_FILE${NC}"
echo -e "  2. Run ${CYAN}bvm --help${NC} to get started."
