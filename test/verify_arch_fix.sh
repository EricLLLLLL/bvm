#!/bin/bash

# Mock environment functions
uname() {
    if [ "$1" == "-m" ]; then echo "x86_64"; else /usr/bin/uname "$@"; fi
}
sysctl() {
    if [ "$1" == "-in" ] && [ "$2" == "hw.optional.arm64" ]; then echo "1"; else /usr/sbin/sysctl "$@"; fi
}

detect_arch_fixed() {
    local OS=$(/usr/bin/uname -s)
    local ARCH=$(uname -m)
    
    # NEW FIXED LOGIC
    if [ "$OS" == "Darwin" ] && [ "$ARCH" == "x86_64" ]; then
        if [ "$(sysctl -in hw.optional.arm64 2>/dev/null)" == "1" ]; then
            ARCH="arm64"
        fi
    fi

    case "$ARCH" in x86_64) A="x64" ;; arm64|aarch64) A="aarch64" ;; *) A="unknown" ;; esac
    echo "$A"
}

echo "Testing FIXED architecture detection logic under Rosetta 2 simulation..."
RESULT=$(detect_arch_fixed)
echo "Detected: $RESULT"

if [ "$RESULT" == "aarch64" ]; then
    echo "✅ SUCCESS: Correctly detected aarch64 on Apple Silicon hardware even under Rosetta!"
    exit 0
else
    echo "❌ FAILURE: Logic still failed to detect aarch64."
    exit 1
fi
