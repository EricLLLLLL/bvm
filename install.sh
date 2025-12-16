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

echo -e "${BLUE}Installing BVM (Bun Version Manager)...${NC}"

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
BUN_DOWNLOAD_URL="https://github.com/oven-sh/bun/releases/download/bun-v${REQUIRED_BUN_VERSION}/${BUN_ASSET_NAME}.zip"

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
  # Download to temp
  TEMP_ZIP="${BVM_DIR}/bun-runtime.zip"
  curl -fsSL "$BUN_DOWNLOAD_URL" -o "$TEMP_ZIP"
  
  # Extract
  unzip -q -o "$TEMP_ZIP" -d "$BVM_DIR"
  mv "${BVM_DIR}/${BUN_ASSET_NAME}" "$TARGET_RUNTIME_DIR"
  rm "$TEMP_ZIP"
  
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
    # In production, download from GitHub Releases
    echo -e "${BLUE}Downloading BVM source...${NC}"
    # SOURCE_URL="https://github.com/bvm-cli/bvm/releases/latest/download/bvm-source.js"
    # curl -fsSL "$SOURCE_URL" -o "${BVM_SRC_DIR}/index.js"
    echo -e "${RED}Local dist/index.js not found and remote download not configured.${NC}"
    exit 1
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
echo -e "Please add ${BVM_BIN_DIR} to your PATH."
echo -e "  export PATH=\"${BVM_BIN_DIR}:\$PATH\""