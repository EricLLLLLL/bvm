#!/bin/bash
set -e

# BVM Configuration
BVM_DIR="${HOME}/.bvm"
BVM_SRC_DIR="${BVM_DIR}/src"
BVM_RUNTIME_DIR="${BVM_DIR}/runtime"
BVM_BIN_DIR="${BVM_DIR}/bin"

# The Bun version that BVM itself runs on
REQUIRED_BUN_VERSION="1.3.4"

# Colors & Styles
RED='\033[1;31m'      # Error (Bold Red)
GREEN='\033[1;32m'    # Success (Bold Green)
YELLOW='\033[1;33m'   # Warning (Bold Yellow)
BLUE='\033[1;34m'     # Info/Secondary (Bold Blue)
CYAN='\033[1;36m'     # Primary/Brand (Bold Cyan)
GRAY='\033[0;90m'     # Dim/Muted
BOLD='\033[1m'
NC='\033[0m' # No Color

# Logo
echo -e "${CYAN}${BOLD}"
cat << "EOF"
______________   _________   
\______   \   \ /   /     \  
 |    |  _/\   Y   /  \ /  \ 
 |    |   \ \     /    Y    \
 |______  /  \___/\____|__  /
        \/                \/ 
EOF
echo -e "${NC}"

echo -e "${CYAN}${BOLD}🚀 Installing BVM (Bun Version Manager) [v1.2.1]...${NC}"

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
# Allow overriding download URL for mirrors (e.g. China)
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
  # Optimization: Copy from ~/.bvm/versions if available
  echo -e "${GREEN}♻️  Found Bun v${REQUIRED_BUN_VERSION} in versions. Copying to runtime...${NC}"
  
  # Clean up target
  rm -rf "$TARGET_RUNTIME_DIR"
  mkdir -p "$TARGET_RUNTIME_DIR/bin"
  
  # Copy binary (bvm only needs the binary to run itself)
  cp "${LOCAL_VERSION_DIR}/bun" "$TARGET_RUNTIME_DIR/bin/bun"
  chmod +x "$TARGET_RUNTIME_DIR/bin/bun"
  
  echo -e "${GREEN}✅ BVM Runtime installed from local copy.${NC}"
elif command -v bun >/dev/null 2>&1 && [ "$(bun --version)" == "$REQUIRED_BUN_VERSION" ]; then
  # Optimization: Copy from global bun if version matches
  echo -e "${GREEN}♻️  Found matching global Bun v${REQUIRED_BUN_VERSION}. Copying to runtime...${NC}"
  
  # Clean up target
  rm -rf "$TARGET_RUNTIME_DIR"
  mkdir -p "$TARGET_RUNTIME_DIR/bin"
  
  # Copy binary
  GLOBAL_BUN_PATH=$(command -v bun)
  cp "$GLOBAL_BUN_PATH" "$TARGET_RUNTIME_DIR/bin/bun"
  chmod +x "$TARGET_RUNTIME_DIR/bin/bun"
  
  echo -e "${GREEN}✅ BVM Runtime installed from global copy.${NC}"
else
  echo -e "${CYAN}📦 Downloading BVM Runtime (Bun v${REQUIRED_BUN_VERSION})...${NC}"
  
  # Ensure clean slate
  if [ -d "$TARGET_RUNTIME_DIR" ]; then
      rm -rf "$TARGET_RUNTIME_DIR"
  fi

  # Download to temp with progress bar
  TEMP_ZIP="${BVM_DIR}/bun-runtime.zip"
  curl -fL --progress-bar "$BUN_DOWNLOAD_URL" -o "$TEMP_ZIP"
  
  # Extract
  echo -e "${CYAN}📂 Extracting...${NC}"
  unzip -q -o "$TEMP_ZIP" -d "$BVM_DIR"
  
  # Move
  mv "${BVM_DIR}/${BUN_ASSET_NAME}" "$TARGET_RUNTIME_DIR"
  rm "$TEMP_ZIP"
  
  # Normalize runtime structure: ensure bin/bun exists
  # Official Bun release zips extract to folder/bun (no bin dir)
  if [ -f "$TARGET_RUNTIME_DIR/bun" ] && [ ! -d "$TARGET_RUNTIME_DIR/bin" ]; then
      mkdir -p "$TARGET_RUNTIME_DIR/bin"
      mv "$TARGET_RUNTIME_DIR/bun" "$TARGET_RUNTIME_DIR/bin/bun"
  fi
  
  echo -e "${GREEN}✅ BVM Runtime installed.${NC}"
fi

# Cleanup old runtime versions (excluding the current one)
echo -e "${BLUE}🗑️  Cleaning up old BVM Runtimes...${NC}"
find "$BVM_RUNTIME_DIR" -mindepth 1 -maxdepth 1 -type d -not -name "v$REQUIRED_BUN_VERSION" -exec rm -rf {} +


# Link 'current' runtime
rm -f "${BVM_RUNTIME_DIR}/current"
ln -s "$TARGET_RUNTIME_DIR" "${BVM_RUNTIME_DIR}/current"

# 4. Install BVM Source Code
# We expect a bundled 'index.js' to be available.
if [ -f "dist/index.js" ]; then
    echo -e "${BLUE}📄 Installing BVM source from local dist/index.js...${NC}"
    cp "dist/index.js" "${BVM_SRC_DIR}/index.js"
else
    echo -e "${CYAN}⬇️  Downloading BVM source...${NC}"
    # Download directly from GitHub Releases (latest)
    SOURCE_URL="https://github.com/bvm-cli/bvm/releases/latest/download/index.js"
    
    # Allow override
    if [ -n "$BVM_SOURCE_URL" ]; then
        SOURCE_URL="$BVM_SOURCE_URL"
    fi

    if curl -fL --progress-bar "$SOURCE_URL" -o "${BVM_SRC_DIR}/index.js"; then
        echo -e "${GREEN}✅ Source downloaded.${NC}"
    else
        echo -e "${RED}❌ Failed to download source. Please check your network.${NC}"
        exit 1
    fi
fi


# 5. Create Wrapper Script
WRAPPER_PATH="${BVM_BIN_DIR}/bvm"
cat > "$WRAPPER_PATH" <<EOF
#!/bin/bash
export BVM_DIR="$BVM_DIR"
# Use the private runtime
exec "${BVM_RUNTIME_DIR}/current/bin/bun" "${BVM_SRC_DIR}/index.js" "\$@"
EOF

chmod +x "$WRAPPER_PATH"

echo -e "${GREEN}${BOLD}🎉 BVM installed successfully!${NC}"

# 6. Auto-configure Shell
echo -e "${CYAN}⚙️  Configuring shell environment...${NC}"
# Use the newly installed bvm to run setup
"$WRAPPER_PATH" setup --silent

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
echo -e "  1. Restart your terminal or run: ${YELLOW}source $CONF_FILE${NC}"
echo -e "  2. Run ${CYAN}bvm --help${NC} to get started."
