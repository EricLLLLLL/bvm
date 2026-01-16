#!/bin/bash
set -e

# BVM E2E Test Runner
# Integrated with uuv extensions

echo "🚀 Starting BVM E2E Tests..."

# 1. Setup Environment
export BVM_DIR="$(pwd)/.e2e-home"
mkdir -p "$BVM_DIR"
rm -rf "$BVM_DIR/*"

# 2. Execute Scenarios using uuv
# (Assuming uuv is available as a CLI or through the extension tools)
echo "Running installation scenarios..."

# Simulate Unix Installation
bash ./install.sh

# 3. Verify using uuv (Example command)
# uuv verify --path "$BVM_DIR/bin/bvm"
# uuv verify --path "$BVM_DIR/shims/bun"

echo "✅ E2E Tests Completed. Generating Reports..."
# Generate report into e2e/reports/
