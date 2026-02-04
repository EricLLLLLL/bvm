#!/bin/bash

# bvm-init.sh: Initializes bvm default version on shell startup

# Check if BVM_DIR is set
if [ -z "${BVM_DIR}" ]; then
  return
fi

_bvm_normalize_path() {
  local shims="${BVM_DIR}/shims"
  local bin="${BVM_DIR}/bin"
  local current_bin="${BVM_DIR}/current/bin"

  local p=":${PATH:-}:"
  p="${p//:${shims}:/:}"
  p="${p//:${bin}:/:}"
  p="${p//:${current_bin}:/:}"
  p="${p#:}"
  p="${p%:}"

  if [ -n "${p}" ]; then
    export PATH="${shims}:${bin}:${p}:${current_bin}"
  else
    export PATH="${shims}:${bin}:${current_bin}"
  fi
}

# Ensure PATH order is correct for this session (self-healing).
_bvm_normalize_path

# Provide a shell function wrapper so `bvm use` can refresh PATH/hash immediately.
# This is the only way to make version switching feel "instant" in the current shell.
bvm() {
  local subcmd="${1:-}"
  command "${BVM_DIR}/bin/bvm" "$@"
  local code=$?

  case "${subcmd}" in
    use|install|i|uninstall|rehash|default|alias|unalias|setup|deactivate)
      _bvm_normalize_path
      if command -v hash >/dev/null 2>&1; then
        hash -r >/dev/null 2>&1 || true
      fi
      ;;
  esac

  return "${code}"
}
