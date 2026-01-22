#!/bin/bash

# Mock environment functions
uname() {
    if [ "$1" == "-m" ]; then echo "x86_64"; else /usr/bin/uname "$@"; fi
}
sysctl() {
    if [ "$1" == "-in" ] && [ "$2" == "hw.optional.arm64" ]; then echo "1"; else /usr/sbin/sysctl "$@"; fi
}

detect_arch() {
    local OS=$(/usr/bin/uname -s) # Use real uname for OS
    local ARCH=$(uname -m)        # Use mocked uname for ARCH
    
    # Current buggy logic (only relies on uname -m)
    case "$ARCH" in x86_64) A="x64" ;; arm64|aarch64) A="aarch64" ;; *) A="unknown" ;; esac
    echo "$A"
}

echo "Testing current architecture detection logic under Rosetta 2 simulation..."
RESULT=$(detect_arch)
echo "Detected: $RESULT"

if [ "$RESULT" == "x64" ]; then
    echo "❌ BUG REPRODUCED: Detected x64 on Apple Silicon hardware under Rosetta!"
    exit 0 # Exit 0 to let the test runner know we successfully reproduced it
else
    echo "✅ Logic already handles it (unexpected for Red Phase)."
    exit 1
fi
