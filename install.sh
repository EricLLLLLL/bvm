#!/bin/bash

# BVM Installer
#
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/bvm-cli/bvm/main/install.sh | bash
#   or
#   wget -qO- https://raw.githubusercontent.com/bvm-cli/bvm/main/install.sh | bash
#

set -e # Exit immediately if a command exits with a non-zero status

# --- Configuration ---
# Repo: bvm-cli/bvm
REPO="bvm-cli/bvm" 
# ---------------------

# Reset
Color_Off='\033[0m'       # Text Reset

# Regular Colors (only used if _colorize is active)
Red='\033[0;31m'          # Red
Green='\033[0;32m'        # Green
Yellow='\033[0;33m'       # Yellow
Blue='\033[0;34m'         # Blue
Cyan='\033[0;36m'         # Cyan

# Function to colorize text only if running in a TTY
_colorize() {
  local color="$1"
  local text="$2"
  if [[ -t 1 ]]; then # Check if stdout is a tty
    echo -e "${color}${text}${Color_Off}"
  else
    echo "$text"
  fi
}

# --- Simple Shell Spinner ---
spinner() {
  local pid=$!
  local delay=0.1
  local spinstr='|/-\'
  echo -n " "
  while ps -p $pid > /dev/null; do
    local temp=${spinstr#?}
    printf "\b%c" "$spinstr"
    spinstr=$temp${spinstr%"$temp"}
    sleep $delay
  done
  printf "\b "
}

print_logo() {
  local version="$1"
  local start_color=""
  local reset_color=""
  if [[ -t 1 ]]; then
    start_color='\033[36m'
    reset_color='\033[0m'
  fi
  printf "%b" "$start_color"
  cat <<'EOF'
______________   _________   \
\______   \   \ /   /     \  
 |    |  _/\   Y   /  \ /  \ 
 |    |   \ \     /    Y    \
 |______  /  \___/\____|__  /
        \/                \/ 
EOF
  printf "%b" "$reset_color"
  printf "    Bun Version Manager · Built with Bun\n"
  printf "    Version: %s\n\n" "$version"
}

echo "$(_colorize "$Blue" "Installing bvm (Bun Version Manager)...")"

# Detect OS and Arch
OS="$(uname -s)"
ARCH="$(uname -m)"

if [[ "$OS" == "Linux"* ]]; then
    PLATFORM="linux"
elif [[ "$OS" == "Darwin"* ]]; then
    PLATFORM="darwin"
elif [[ "$OS" == "MINGW"* || "$OS" == "MSYS"* || "$OS" == "CYGWIN"* ]]; then
    PLATFORM="windows"
else
    echo "$(_colorize "$Red" "Error: Unsupported OS: $OS (Actual value: \"$(uname -s)\")")"
    exit 1
fi

case "$ARCH" in
  x86_64)
    ARCH="x64"
    ;;
  aarch64|arm64)
    ARCH="aarch64"
    ;;
  *)
    echo "$(_colorize "$Red" "Error: Unsupported Architecture: $ARCH")"
    exit 1
    ;;
esac

if [ "$PLATFORM" == "windows" ]; then
    EXTENSION=".exe"
else
    EXTENSION=""
fi

ASSET_NAME="bvm-${PLATFORM}-${ARCH}${EXTENSION}"

# --- Get release tag ---
if [ -n "$BVM_INSTALL_VERSION" ]; then
  LATEST_TAG="$BVM_INSTALL_VERSION"
  echo "Using specified version: $(_colorize "$Green" "$LATEST_TAG")"
else
  echo "Fetching latest release tag..."
  
  # Method 1: Get tag from GitHub Releases redirect (Avoids API Rate Limits)
  if command -v curl >/dev/null 2>&1; then
    LATEST_TAG=$(curl -sI "https://github.com/${REPO}/releases/latest" | grep -i "location:" | sed 's#.*/tag/##' | tr -d '\r')
  fi

  # Method 2: Fallback to GitHub API (if Method 1 fails or returns empty)
  if [ -z "$LATEST_TAG" ]; then
    echo "  (Fallback: Checking GitHub API...)"
    LATEST_RELEASE_JSON=$(curl -s "https://api.github.com/repos/${REPO}/releases/latest")
    
    if command -v jq >/dev/null 2>&1; then
      LATEST_TAG=$(echo "$LATEST_RELEASE_JSON" | jq -r ".tag_name")
    else
      LATEST_TAG=$(echo "$LATEST_RELEASE_JSON" | grep "tag_name" | head -n 1 | cut -d : -f 2- | tr -d \" | tr -d , | tr -d " ")
    fi
  fi
fi

# Trim whitespace (including newlines)
LATEST_TAG="$(echo "${LATEST_TAG}" | tr -d '[:space:]')"

if [ -z "$LATEST_TAG" ] || [ "$LATEST_TAG" = "null" ]; then
    echo "$(_colorize "$Red" "Error: Could not fetch the latest release tag from GitHub API.")"
    
    # Check for rate limit message
    if echo "$LATEST_RELEASE_JSON" | grep -q "rate limit"; then
      echo "$(_colorize "$Yellow" "Reason: GitHub API rate limit exceeded.")"
    fi
    
    echo "$(_colorize "$Yellow" "GitHub API response (partial):")"
    echo "$LATEST_RELEASE_JSON" | head -n 5 # Print first 5 lines of API response for debug
    exit 1
fi
echo "Latest tag found: $(_colorize "$Green" "$LATEST_TAG")"

print_logo "$LATEST_TAG"

DOWNLOAD_URL="https://github.com/${REPO}/releases/download/${LATEST_TAG}/${ASSET_NAME}"

# Installation Directory
BVM_DIR="${HOME}/.bvm"
BIN_DIR="${BVM_DIR}/bin"

# Ensure directories exist
mkdir -p "$BIN_DIR"

TARGET_BIN="${BIN_DIR}/bvm${EXTENSION}"
TEMP_BIN="${TARGET_BIN}.tmp"

if [[ -n "$BVM_INSTALL_SOURCE" ]]; then
  echo "Using local installer binary: $(_colorize "$Yellow" "$BVM_INSTALL_SOURCE")"
  cp "$BVM_INSTALL_SOURCE" "$TEMP_BIN"
else
  echo "Detecting platform: $(_colorize "$Green" "${PLATFORM} ${ARCH}")${Color_Off}"
  echo "Downloading bvm from: $(_colorize "$Yellow" "$DOWNLOAD_URL")"

  # --- Start download with Spinner ---
  if [[ -t 1 ]]; then # If running in a TTY, use spinner
      (
          if command -v curl >/dev/null 2>&1; then
            curl -fsSL "$DOWNLOAD_URL" -o "$TEMP_BIN"
          elif command -v wget >/dev/null 2>&1; then
            wget -qO "$TEMP_BIN" "$DOWNLOAD_URL"
          else
            echo "$(_colorize "$Red" "Error: curl or wget is required to install bvm.")"
            exit 1
          fi
      ) & spinner
  else # If not TTY, just show silent download
      if command -v curl >/dev/null 2>&1; then
        curl -fsSL "$DOWNLOAD_URL" -o "$TEMP_BIN"
      elif command -v wget >/dev/null 2>&1; then
        wget -qO "$TEMP_BIN" "$DOWNLOAD_URL"
      else
        echo "$(_colorize "$Red" "Error: curl or wget is required to install bvm.")"
        exit 1
      fi
  fi
fi

chmod +x "$TEMP_BIN"
mv -f "$TEMP_BIN" "$TARGET_BIN"

echo "$(_colorize "$Green" "✓ bvm installed to ${BIN_DIR}/bvm${EXTENSION}")"

# Configure Shell
echo "Configuring shell via 'bvm setup'..."
"${BIN_DIR}/bvm${EXTENSION}" setup
echo "$(_colorize "$Green" "✓ Shell configured")"

# --- Auto-install latest Bun version ---
echo "Installing latest Bun version..."
if "${BIN_DIR}/bvm${EXTENSION}" install latest; then
    echo "$(_colorize "$Green" "✓ Bun (latest) installed successfully")"
else
    echo "$(_colorize "$Yellow" "⚠ Failed to auto-install Bun. You can try running 'bvm install latest' manually later.")"
fi

# --- Smart Activation Hint ---
USER_SHELL=""

# Attempt 1: From SHELL environment variable
if [ -n "$SHELL" ]; then
  USER_SHELL="$(basename "$SHELL")"
fi

# Attempt 2: If SHELL is empty, try to detect from process info (common in minimal containers)
if [ -z "$USER_SHELL" ]; then
  if [ -f "/proc/$$/exe" ]; then
    USER_SHELL="$(basename "$(readlink /proc/$$/exe)")"
  else
    USER_SHELL="unknown"
  fi
fi

CONFIG_FILE=""

case "$USER_SHELL" in
  zsh)
    CONFIG_FILE="$HOME/.zshrc"
    ;;
  bash)
    if [[ "$PLATFORM" == "darwin" ]]; then
      # macOS often uses .bash_profile
      if [ -f "$HOME/.bash_profile" ]; then
        CONFIG_FILE="$HOME/.bash_profile"
      else
        CONFIG_FILE="$HOME/.bashrc"
      fi
    else
      # Linux / Git Bash usually uses .bashrc
      CONFIG_FILE="$HOME/.bashrc"
    fi
    ;;
  fish)
    CONFIG_FILE="$HOME/.config/fish/config.fish"
    ;;
esac

echo ""
echo "$(_colorize "$Green" "🎉 bvm installation complete!")"
echo ""
echo "To start using bvm and bun immediately, run the following command:"
echo ""

if [ -n "$CONFIG_FILE" ]; then
    echo "    $(_colorize "$Cyan" "source $CONFIG_FILE")"
else
    # Fallback for unknown shells or systems
    echo "    $(_colorize "$Cyan" "export BVM_DIR=\"$HOME/.bvm\" && export PATH=\"\$BVM_DIR/bin:\$PATH\"")"
    echo ""
    echo "Note: We couldn't detect your shell configuration file."
    echo "Please manually add $(_colorize "$Yellow" "$HOME/.bvm/bin") to your PATH."
fi

echo ""
