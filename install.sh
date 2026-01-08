#!/bin/bash
set -e

BVM_DIR="${HOME}/.bvm"
BVM_SRC_DIR="${BVM_DIR}/src"
BVM_RUNTIME_DIR="${BVM_DIR}/runtime"
BVM_BIN_DIR="${BVM_DIR}/bin"
BVM_SHIMS_DIR="${BVM_DIR}/shims"
BVM_ALIAS_DIR="${BVM_DIR}/aliases"

# Professional Bar Style (Minimalist)
show_bar() {
    local p=$1
    local w=40
    local f=$(( p * w / 100 ))
    local e=$(( w - f ))
    printf "\r\033[1;36m"
    for ((i=0; i<f; i++)); do printf "█"; done
    printf "\033[0;90m"
    for ((i=0; i<e; i++)); do printf "░"; done
    printf "\033[0m %3d%%" "$p"
}

DEFAULT_BVM_VERSION="v1.0.6"
BVM_SRC_VERSION="${BVM_INSTALL_VERSION:-$DEFAULT_BVM_VERSION}"

# 1. Resolve Bun Version
FALLBACK_BUN_VERSION="1.3.5"
LATEST_COMPATIBLE_VERSION=$(curl -s https://registry.npmjs.org/bun | grep -oE '"[0-9]+\.[0-9]+\.[0-9]+":' | tr -d '"': | grep -E '^1\.' | sort -V | tail -n 1)
BUN_VER="${LATEST_COMPATIBLE_VERSION:-$FALLBACK_BUN_VERSION}"

# 2. Setup Runtime
mkdir -p "$BVM_DIR" "$BVM_SRC_DIR" "$BVM_RUNTIME_DIR" "$BVM_BIN_DIR" "$BVM_SHIMS_DIR" "$BVM_ALIAS_DIR"
TARGET_RUNTIME_DIR="${BVM_RUNTIME_DIR}/v${BUN_VER}"

if [ ! -f "${TARGET_RUNTIME_DIR}/bin/bun" ]; then
    echo "Downloading BVM Runtime (bun@${BUN_VER})"
    OS="$(uname -s | tr -d '"')"
    ARCH="$(uname -m | tr -d '"')"
    case "$OS" in Linux) P="linux" ;; Darwin) P="darwin" ;; *) exit 1 ;; esac
    case "$ARCH" in x86_64) A="x64" ;; arm64|aarch64) A="aarch64" ;; *) exit 1 ;; esac
    if [ "$P" == "darwin" ]; then PKG="@oven/bun-darwin-$A"; else PKG="@oven/bun-linux-$A"; fi
    URL="https://registry.npmjs.org/${PKG}/-/${PKG##*/}-${BUN_VER}.tgz"
    TEMP_TGZ="${BVM_DIR}/bun-runtime.tgz"
    
    # Capture curl progress
    curl -L -# "$URL" -o "$TEMP_TGZ" 2>&1 | tr '\r' '\n' | sed -u 's/^[[:space:]]*//' | grep --line-buffered -oE '[0-9]+(\.[0-9]+)?' | while read -r p; do
        show_bar "${p%.*}"
    done
    echo -e "\n"

    T_EXT="${BVM_DIR}/temp_extract"
    mkdir -p "$T_EXT"
    tar -xzf "$TEMP_TGZ" -C "$T_EXT"
    mkdir -p "${TARGET_RUNTIME_DIR}/bin"
    mv "$(find "$T_EXT" -type f -name \"bun\" | head -n 1)" "${TARGET_RUNTIME_DIR}/bin/bun"
    chmod +x "${TARGET_RUNTIME_DIR}/bin/bun"
    rm -rf "$T_EXT" "$TEMP_TGZ"
fi
ln -sf "$TARGET_RUNTIME_DIR" "${BVM_RUNTIME_DIR}/current"

# 3. Download BVM Source
echo "Downloading BVM: ${BVM_SRC_VERSION}"
SRC_URL="https://cdn.jsdelivr.net/gh/EricLLLLLL/bvm@${BVM_SRC_VERSION}/dist/index.js"
show_bar 0
curl -sL "$SRC_URL" -o "${BVM_SRC_DIR}/index.js"
show_bar 100
echo -e "\n"

# 4. Finalize
printf "Configuring shell... "
WRAPPER="${BVM_BIN_DIR}/bvm"
cat > "$WRAPPER" <<EOF
#!/bin/bash
export BVM_DIR="$BVM_DIR"
exec "${BVM_RUNTIME_DIR}/current/bin/bun" "$BVM_SRC_DIR/index.js" "\$@"
EOF
chmod +x "$WRAPPER"

if [ ! -f "${BVM_ALIAS_DIR}/default" ]; then
    mkdir -p "${BVM_DIR}/versions/v${BUN_VER}/bin"
    ln -sf "${TARGET_RUNTIME_DIR}/bin/bun" "${BVM_DIR}/versions/v${BUN_VER}/bin/bun"
    echo "v${BUN_VER}" > "${BVM_ALIAS_DIR}/default"
fi

"$WRAPPER" setup --silent >/dev/null 2>&1
"$WRAPPER" rehash --silent >/dev/null 2>&1
echo "Done."

echo -e "\n\033[1;32m🎉 BVM ${BVM_SRC_VERSION} installed successfully!\033[0m"
echo -e "\nNext steps:"
echo -e "  1. Run: \033[1msource ~/.zshrc\033[0m (or your shell config)"
echo -e "  2. Run 'bvm --help' to get started.