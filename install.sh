#!/bin/bash
# Unified Installation Logic: strict isolation, idempotency.
set -e

# --- Configuration ---
DEFAULT_BVM_VERSION="v1.1.42" # Fallback
FALLBACK_BUN_VERSION="1.3.11"
BVM_SRC_VERSION="${BVM_INSTALL_VERSION}" # If empty, will resolve dynamically

# --- Colors ---
if [ -t 1 ]; then
  RED="\033[1;31m" GREEN="\033[1;32m" YELLOW="\033[1;33m" BLUE="\033[1;34m"
  CYAN="\033[1;36m" GRAY="\033[90m" BOLD="\033[1m" DIM="\033[2m" RESET="\033[0m"
else
  RED="" GREEN="" YELLOW="" BLUE="" CYAN="" GRAY="" BOLD="" DIM="" RESET=""
fi

# --- Directories ---
BVM_DIR="${BVM_DIR:-${HOME}/.bvm}"
BVM_SRC_DIR="${BVM_DIR}/src"
BVM_RUNTIME_DIR="${BVM_DIR}/runtime"
BVM_BIN_DIR="${BVM_DIR}/bin"
BVM_SHIMS_DIR="${BVM_DIR}/shims"
BVM_ALIAS_DIR="${BVM_DIR}/aliases"
BVM_VERSIONS_DIR="${BVM_DIR}/versions"

# --- Helpers ---
info() { echo -e "${BLUE}ℹ${RESET} $1"; }
success() { echo -e "${GREEN}✓${RESET} $1"; }
warn() { echo -e "${YELLOW}?${RESET} $1"; }
error() { echo -e "${RED}✖${RESET} $1"; exit 1; }

download_file() {
    local url="$1" dest="$2" desc="$3"
    echo -n -e "${BLUE}ℹ${RESET} $desc "
    # Add -C - for resume support and increase max-time to 10 minutes
    curl -L -C - --connect-timeout 20 --max-time 600 --retry 3 -s -S -f "$url" -o "$dest" &
    local pid=$!
    local delay=0.1
    local spinstr='|/-\'
    printf "\033[?25l"
    while kill -0 "$pid" 2>/dev/null; do
        local temp=${spinstr#?}
        printf "${CYAN}%c${RESET}" "$spinstr"
        local spinstr=$temp${spinstr%"$temp"}
        sleep $delay
        printf "\b"
    done
    printf "\033[?25h"
    if wait "$pid"; then
        echo -e "${GREEN}Done${RESET}"
    else
        echo -e "${RED}Failed${RESET}"
        return 1
    fi
}

json_string_field() {
    local field="$1"
    grep -oE "\"${field}\"[[:space:]]*:[[:space:]]*\"[^\"]+\"" | head -n 1 | cut -d'"' -f4
}

# Verify npm metadata field: dist.integrity (SHA-512 SRI) before extraction.
verify_sha512() {
    local file="$1" integrity="$2"
    command -v openssl >/dev/null 2>&1 || error "openssl is required to verify downloaded artifacts."
    case "$integrity" in
      sha512-*) ;;
      *) error "Registry metadata is missing a valid SHA-512 integrity value." ;;
    esac
    local expected="${integrity#sha512-}"
    local actual
    actual=$(openssl dgst -sha512 -binary "$file" | openssl base64 -A)
    if [ "$actual" != "$expected" ]; then
        rm -f "$file"
        error "SHA-512 integrity verification failed for $file."
    fi
}

registry_candidates() {
    local explicit="${BVM_REGISTRY:-${BVM_DOWNLOAD_MIRROR:-}}"
    if [ -n "$explicit" ]; then
        printf '%s\n' "${explicit%/}"
        return
    fi
    printf '%s\n' \
      "https://registry.npmmirror.com" \
      "https://mirrors.cloud.tencent.com/npm" \
      "https://registry.npmjs.org"
}

latest_registry_version() {
    local package="$1" registry metadata latest
    for registry in $REGISTRIES; do
        metadata=$(curl -fsSL --connect-timeout 5 --max-time 20 "${registry}/-/package/${package}/dist-tags" 2>/dev/null || true)
        latest=$(printf '%s' "$metadata" | json_string_field latest)
        if [ -n "$latest" ]; then
            printf '%s\n' "$latest"
            return 0
        fi
    done
    return 1
}

download_registry_package() {
    local package="$1" version="$2" dest="$3" desc="$4"
    local registry metadata url integrity
    for registry in $REGISTRIES; do
        metadata=$(curl -fsSL --connect-timeout 5 --max-time 30 "${registry}/${package}/${version}" 2>/dev/null || true)
        url=$(printf '%s' "$metadata" | json_string_field tarball)
        integrity=$(printf '%s' "$metadata" | json_string_field integrity)
        case "$integrity" in sha512-*) ;; *) continue ;; esac
        [ -n "$url" ] || continue
        rm -f "$dest"
        if download_file "$url" "$dest" "$desc via ${registry}"; then
            verify_sha512 "$dest" "$integrity"
            SELECTED_REGISTRY="$registry"
            return 0
        fi
    done
    return 1
}

detect_network_zone() {
  [ -n "$BVM_REGION" ] && echo "$BVM_REGION" && return
  if [ -n "$BVM_TEST_FORCE_CN" ]; then echo "cn"
  elif [ -n "$BVM_TEST_FORCE_GLOBAL" ]; then echo "global"
  elif curl -s -m 1.5 https://npm.elemecdn.com > /dev/null; then echo "cn"
  else echo "global"
  fi
}

detect_shell() {
  local shell_name=""
  if command -v ps >/dev/null 2>&1; then
     local proc_name
     proc_name=$(ps -p "$PPID" -o comm= 2>/dev/null)
     [ -n "$proc_name" ] && shell_name="${proc_name##*/}"
  fi
  shell_name="${shell_name#-}"
  case "$shell_name" in
    *zsh) echo "zsh" ;;
    *bash) echo "bash" ;;
    *fish) echo "fish" ;;
    *) [ -n "$SHELL" ] && echo "${SHELL##*/}" || echo "unknown" ;;
  esac
}

# --- Checks ---
command -v curl >/dev/null || error "curl is required."
command -v tar >/dev/null || error "tar is required."

# --- Main Script ---
USE_LOCAL_ASSETS=false
for arg in "$@"; do
  case $arg in
    --local) USE_LOCAL_ASSETS=true ;;
  esac
done

BVM_REGION=$(detect_network_zone)
REGISTRIES=$(registry_candidates)

echo -e "${CYAN}__________              \n\______   \__  _______  \n |    |  _|  \/ /     \ \n |    |   \\   /  Y Y  \ \n |______  / \_/|__|_|  / \n        \/           \/ ${RESET}"
echo -e "${CYAN}${BOLD}BVM Installer${RESET} ${DIM}(${BVM_REGION})${RESET}
"

# 1. Self-Conflict Detection (Ensure consistent install source)
BVM_BIN_PATH="${BVM_BIN_DIR}/bvm"
if [ -f "$BVM_BIN_PATH" ]; then
    if grep -q 'BVM_INSTALL_SOURCE="npm"' "$BVM_BIN_PATH"; then
        error "BVM was installed via npm. Please use 'npm install -g bvm-core' or 'bvm upgrade' to upgrade."
    elif grep -q 'BVM_INSTALL_SOURCE="bun"' "$BVM_BIN_PATH"; then
        error "BVM was installed via bun. Please use 'bun install -g bvm-core' or 'bvm upgrade' to upgrade."
    fi
fi

# 3. Setup Directories
mkdir -p "$BVM_DIR" "$BVM_SRC_DIR" "$BVM_RUNTIME_DIR" "$BVM_BIN_DIR" "$BVM_SHIMS_DIR" "$BVM_ALIAS_DIR" "$BVM_VERSIONS_DIR"

# 4. Resolve BVM Version & Download
if [ "$USE_LOCAL_ASSETS" = true ]; then
    if [ -f "./dist/index.js" ] && [ -f "./dist/bvm-shim.sh" ]; then
        BVM_SRC_VERSION="v-local"
        info "Explicitly using local BVM core assets (--local)."
        cp "./dist/index.js" "${BVM_SRC_DIR}/index.js"
        cp "./dist/bvm-shim.sh" "${BVM_BIN_DIR}/bvm-shim.sh"
    else
        error "--local flag provided but ./dist/index.js or ./dist/bvm-shim.sh not found."
    fi
else
    echo -n -e "${BLUE}ℹ${RESET} Resolving versions... "
    if [ -z "$BVM_SRC_VERSION" ]; then
        BVM_LATEST=$(latest_registry_version "bvm-core" || true)
        BVM_SRC_VERSION="v${BVM_LATEST:-$DEFAULT_BVM_VERSION}"
    fi
    echo -e "${GREEN}${BVM_SRC_VERSION}${RESET}"

    TEMP_TGZ=$(mktemp)
    download_registry_package "bvm-core" "${BVM_SRC_VERSION#v}" "$TEMP_TGZ" \
      "Downloading BVM Source (${BVM_SRC_VERSION})..." \
      || error "Unable to download verified BVM source from the configured registries."
    tar -xzf "$TEMP_TGZ" -C "$BVM_SRC_DIR" --strip-components=2 "package/dist/index.js"
    tar -xzf "$TEMP_TGZ" -C "$BVM_BIN_DIR" --strip-components=2 "package/dist/bvm-shim.sh"
    rm -f "$TEMP_TGZ"
fi
chmod +x "${BVM_BIN_DIR}/bvm-shim.sh"

# 5. Bootstrapping Runtime (Using system bun if available, READ-ONLY)
SYSTEM_BUN_BIN=$(command -v bun || echo "")
# Guard: Do not use BVM's own shims as the bootstrap runtime
if [[ "$SYSTEM_BUN_BIN" == *".bvm/shims"* ]] || [[ "$SYSTEM_BUN_BIN" == *".bvm/bin"* ]]; then
    SYSTEM_BUN_BIN=""
fi
SYSTEM_BUN_VER=""
[ -n "$SYSTEM_BUN_BIN" ] && SYSTEM_BUN_VER=$(bun --version | sed 's/^v//')

USE_SYSTEM_AS_RUNTIME=false
BUN_VER=""

if [ -n "$SYSTEM_BUN_BIN" ]; then
    info "Bootstrapping with detected system Bun v${SYSTEM_BUN_VER}..."
    SYS_RUNTIME_DIR="${BVM_RUNTIME_DIR}/v${SYSTEM_BUN_VER}"
    mkdir -p "${SYS_RUNTIME_DIR}/bin"
    if [ "$SYSTEM_BUN_BIN" != "${SYS_RUNTIME_DIR}/bin/bun" ]; then
        cp "$SYSTEM_BUN_BIN" "${SYS_RUNTIME_DIR}/bin/bun"
    fi
    chmod +x "${SYS_RUNTIME_DIR}/bin/bun"
    ln -sf "./bun" "${SYS_RUNTIME_DIR}/bin/bunx"
    
    # Generate bunfig.toml
    cat > "${SYS_RUNTIME_DIR}/bunfig.toml" <<EOF
[install]
globalDir = "${SYS_RUNTIME_DIR}"
globalBinDir = "${SYS_RUNTIME_DIR}/bin"
EOF

    # Link registry to physical runtime
    mkdir -p "$BVM_VERSIONS_DIR"
    ln -sf "../runtime/v${SYSTEM_BUN_VER}" "${BVM_VERSIONS_DIR}/v${SYSTEM_BUN_VER}"
    
    # Smoke Test
    if "${SYS_RUNTIME_DIR}/bin/bun" "${BVM_SRC_DIR}/index.js" --version >/dev/null 2>&1; then
        success "Smoke Test passed."
        USE_SYSTEM_AS_RUNTIME=true
        BUN_VER="v${SYSTEM_BUN_VER}"
        TARGET_PHYSICAL_DIR="$SYS_RUNTIME_DIR"
    else
        warn "Smoke Test failed. Will download fresh runtime."
    fi
fi

if [ "$USE_SYSTEM_AS_RUNTIME" = true ]; then

    TARGET_PHYSICAL_DIR="$SYS_RUNTIME_DIR"

else

    # Resolve and download compatible runtime

    BUN_LATEST=$(latest_registry_version "bun" || true)
    BUN_LATEST="${BUN_LATEST:-$FALLBACK_BUN_VERSION}"

    BUN_VER="v${BUN_LATEST}"

    TARGET_PHYSICAL_DIR="${BVM_RUNTIME_DIR}/${BUN_VER}"

    

    if [ ! -x "${TARGET_PHYSICAL_DIR}/bin/bun" ]; then

        TEMP_DIR_BUN=$(mktemp -d)

        TEMP_TGZ_BUN="${TEMP_DIR_BUN}/bun-runtime.tgz"



        if [ -n "$BVM_LOCAL_RUNTIME_PATH" ] && [ -f "$BVM_LOCAL_RUNTIME_PATH" ]; then

            info "Using local runtime archive: $BVM_LOCAL_RUNTIME_PATH"

            cp "$BVM_LOCAL_RUNTIME_PATH" "$TEMP_TGZ_BUN"

        else

            OS="$(uname -s | tr -d '"')"

            ARCH="$(uname -m | tr -d '"')"

            # ... (keep OS/Arch detection)

            case "$OS" in Linux) P="linux" ;; Darwin) P="darwin" ;; *) error "Unsupported OS: $OS" ;; esac

            if [ "$OS" == "Darwin" ] && [ "$ARCH" == "x86_64" ]; then

                if [ "$(sysctl -n sysctl.proc_translated 2>/dev/null)" == "1" ]; then ARCH="arm64"; fi

            fi

            case "$ARCH" in x86_64) A="x64" ;; arm64|aarch64) A="aarch64" ;; *) error "Unsupported Arch: $ARCH" ;; esac

            

            SUFFIX=""

            if [ "$A" == "x64" ]; then

                if [ "$OS" == "Darwin" ]; then

                    if ! sysctl -a 2>/dev/null | grep -q "AVX2"; then SUFFIX="-baseline"; fi

                elif [ "$OS" == "Linux" ]; then

                    if ! grep -q "avx2" /proc/cpuinfo 2>/dev/null; then SUFFIX="-baseline"; fi

                fi

            fi



            PKG="@oven/bun-$P-$A${SUFFIX}"
            download_registry_package "$PKG" "${BUN_VER#v}" "$TEMP_TGZ_BUN" \
              "Downloading Compatible Runtime (bun@${BUN_VER#v})..." \
              || error "Unable to download a verified Bun runtime from the configured registries."

        fi



        tar -xzf "$TEMP_TGZ_BUN" -C "$TEMP_DIR_BUN"

        mkdir -p "${TARGET_PHYSICAL_DIR}/bin"

        mv "$(find "$TEMP_DIR_BUN" -type f -name "bun" | head -n 1)" "${TARGET_PHYSICAL_DIR}/bin/bun"

        chmod +x "${TARGET_PHYSICAL_DIR}/bin/bun"

        ln -sf "./bun" "${TARGET_PHYSICAL_DIR}/bin/bunx"

        

        # Generate bunfig.toml

        cat > "${TARGET_PHYSICAL_DIR}/bunfig.toml" <<EOF

[install]

globalDir = "${TARGET_PHYSICAL_DIR}"

globalBinDir = "${TARGET_PHYSICAL_DIR}/bin"

EOF

        rm -rf "$TEMP_DIR_BUN"

    fi

    # Link versions directory to physical runtime

    mkdir -p "$BVM_VERSIONS_DIR"

    ln -sf "../runtime/${BUN_VER}" "${BVM_VERSIONS_DIR}/${BUN_VER}"

fi

# 6. Link Current
rm -rf "${BVM_RUNTIME_DIR}/current"
ln -sf "$TARGET_PHYSICAL_DIR" "${BVM_RUNTIME_DIR}/current"

rm -rf "${BVM_DIR}/current"
ln -sf "versions/${BUN_VER}" "${BVM_DIR}/current"

echo "$BUN_VER" > "${BVM_ALIAS_DIR}/default"

# 7. Create Shims & Wrappers
info "Initializing shims..."
cat > "${BVM_BIN_DIR}/bvm" <<EOF
#!/bin/bash
export BVM_DIR="$BVM_DIR"
exec "${BVM_RUNTIME_DIR}/current/bin/bun" "$BVM_SRC_DIR/index.js" "\$@"
EOF
chmod +x "${BVM_BIN_DIR}/bvm"

for cmd in bun bunx; do
  cat > "${BVM_SHIMS_DIR}/${cmd}" <<EOF
#!/bin/bash
export BVM_DIR="$BVM_DIR"
exec "${BVM_BIN_DIR}/bvm-shim.sh" "$cmd" "\$@"
EOF
  chmod +x "${BVM_SHIMS_DIR}/${cmd}"
done
success "Shims initialized."

# 8. Setup Environment (Self-Repair)
if ! "${BVM_BIN_DIR}/bvm" setup --silent >/dev/null 2>&1; then
    warn "Environment setup failed. You may need to manually add BVM to your PATH."
fi

# 9. Final Instructions
success "${BOLD}🎉 BVM Installed Successfully!${RESET}"
CURRENT_SHELL=$(detect_shell)
case "$CURRENT_SHELL" in
  zsh) DP="$HOME/.zshrc" ;;
  bash) DP="$([ -f "$HOME/.bashrc" ] && echo "$HOME/.bashrc" || echo "$HOME/.bash_profile")" ;; 
  fish) DP="$HOME/.config/fish/config.fish" ;; 
  *) DP="$HOME/.profile" ;; 
esac
echo -e "\nTo start using bvm:\n  ${YELLOW}1. Refresh your shell:${RESET}\n     source $DP\n\n  ${YELLOW}2. Verify:${RESET}\n     bvm --version\n\n  ${YELLOW}3. Note:${RESET}\n     Global packages (bun install -g) are isolated per version.\n     BVM shims are used to proxy all commands safely."
