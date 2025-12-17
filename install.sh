#!/bin/bash
set -e

# BVM Configuration
BVM_DIR="${HOME}/.bvm"
BVM_SRC_DIR="${BVM_DIR}/src"
BVM_RUNTIME_DIR="${BVM_DIR}/runtime"
BVM_BIN_DIR="${BVM_DIR}/bin"

# The Bun version that BVM itself runs on
REQUIRED_BUN_VERSION="1.3.4"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Installing BVM (Bun Version Manager) [Installer v1.2.1-patch3]...${NC}"

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
if [ -f "${TARGET_RUNTIME_DIR}/bin/bun" ]; then
  echo -e "${GREEN}BVM Runtime (Bun v${REQUIRED_BUN_VERSION}) already installed.${NC}"
else
  echo -e "${BLUE}Downloading BVM Runtime (Bun v${REQUIRED_BUN_VERSION})...${NC}"
  
  # Ensure clean slate
  if [ -d "$TARGET_RUNTIME_DIR" ]; then
      echo "Cleaning up existing runtime directory..."
      rm -rf "$TARGET_RUNTIME_DIR"
  fi

  # Download to temp
  TEMP_ZIP="${BVM_DIR}/bun-runtime.zip"
  curl -fsSL "$BUN_DOWNLOAD_URL" -o "$TEMP_ZIP"
  
  # Extract
  unzip -q -o "$TEMP_ZIP" -d "$BVM_DIR"
  mv "${BVM_DIR}/${BUN_ASSET_NAME}" "$TARGET_RUNTIME_DIR"
  rm "$TEMP_ZIP"
  
  # Normalize runtime structure: ensure bin/bun exists
  # Official Bun release zips extract to folder/bun (no bin dir)
  if [ -f "$TARGET_RUNTIME_DIR/bun" ] && [ ! -d "$TARGET_RUNTIME_DIR/bin" ]; then
      mkdir -p "$TARGET_RUNTIME_DIR/bin"
      mv "$TARGET_RUNTIME_DIR/bun" "$TARGET_RUNTIME_DIR/bin/bun"
  fi
  
  echo -e "${GREEN}BVM Runtime installed.${NC}"
fi

# Link 'current' runtime
rm -f "${BVM_RUNTIME_DIR}/current"
ln -s "$TARGET_RUNTIME_DIR" "${BVM_RUNTIME_DIR}/current"

# 4. Install BVM Source Code
# We expect a bundled 'index.js' to be available.
if [ -f "dist/index.js" ]; then
    echo -e "${BLUE}Installing BVM source from local dist/index.js...${NC}"
    cp "dist/index.js" "${BVM_SRC_DIR}/index.js"
else
    echo -e "${BLUE}Downloading BVM source...${NC}"
    # Download directly from GitHub Releases (latest)
    # This avoids NPM dependency and ensures version alignment with install.sh
    SOURCE_URL="https://github.com/bvm-cli/bvm/releases/latest/download/index.js"
    
    # Allow override
    if [ -n "$BVM_SOURCE_URL" ]; then
        SOURCE_URL="$BVM_SOURCE_URL"
    fi

    echo -e "${BLUE}Fetching from: $SOURCE_URL${NC}"
    if curl -fsSL "$SOURCE_URL" -o "${BVM_SRC_DIR}/index.js"; then
        echo -e "${GREEN}Source downloaded.${NC}"
    else
        echo -e "${RED}Failed to download source. Please check your network or NPM package availability.${NC}"
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

echo -e "${GREEN}BVM installed successfully!${NC}"

# 6. Auto-configure Shell
echo -e "${BLUE}Configuring shell environment...${NC}"
# Use the newly installed bvm to run setup
"$WRAPPER_PATH" setup --silent

echo -e "You may need to restart your terminal or source your config file."
echo -e "Try running: ${GREEN}source ~/.bashrc${NC} (or .zshrc/.config/fish)"