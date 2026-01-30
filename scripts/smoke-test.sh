#!/bin/bash
set -e

# Comprehensive Smoke Test for BVM
# Platform: macOS/Linux (focus on architecture consistency)

SANDBOX_DIR="$PWD/.sandbox-smoke"
rm -rf "$SANDBOX_DIR"
mkdir -p "$SANDBOX_DIR"

echo "--- 1. Building BVM ---"
npm run build

echo "--- 2. Simulating Installation ---"
export BVM_DIR="$SANDBOX_DIR"
# Mock SHELL to ensure predictable setup behavior
export SHELL="/bin/bash"
node scripts/postinstall.js

echo "--- 3. Verifying Shims & Shims Priority ---"
if [ ! -f "$SANDBOX_DIR/shims/bun" ]; then
    echo "FAILED: bun shim not created"
    exit 1
fi

echo "--- 4. Installing Global Package ---"
# Use the sandboxed bun
"$SANDBOX_DIR/shims/bun" install -g cowsay

echo "--- 5. Verifying Auto-Rehash (Instant Availability) ---"
# Give background rehash a moment
sleep 1
# On macOS, rehash creates a shim script in $BVM_DIR/shims
if [ ! -f "$SANDBOX_DIR/shims/cowsay" ]; then
    echo "FAILED: cowsay shim not generated automatically after install"
    # Try manual rehash to see if it works at all
    "$SANDBOX_DIR/bin/bvm" rehash
    if [ ! -f "$SANDBOX_DIR/shims/cowsay" ]; then
        echo "CRITICAL FAILED: even manual rehash failed"
        exit 1
    fi
    echo "FAILED: auto-rehash didn't work, but manual did"
    exit 1
fi

# Execute the new command
"$SANDBOX_DIR/shims/cowsay" "BVM Smoke Test Success"

echo "--- 6. Verifying No DEP0190 ---"
# Run postinstall again and check stderr
node scripts/postinstall.js 2> .sandbox-smoke/postinstall_stderr.log
if grep -q "DEP0190" .sandbox-smoke/postinstall_stderr.log; then
    echo "FAILED: Found DEP0190 warning in postinstall"
    cat .sandbox-smoke/postinstall_stderr.log
    exit 1
fi

echo "--- SMOKE TEST PASSED ---"
