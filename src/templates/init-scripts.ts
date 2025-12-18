export const BVM_INIT_SH_TEMPLATE = String.raw`#!/bin/bash

# bvm-init.sh: Initializes bvm default version on shell startup

# Check if BVM_DIR is set
if [ -z "${BVM_DIR}" ]; then
  return
fi

# Try to switch to the 'default' version silently.
# We use the absolute path to ensure we are calling the correct binary.
# Errors are suppressed to prevent blocking shell startup if 'default' is missing.
"${BVM_DIR}/bin/bvm" use default --silent >/dev/null 2>&1 || true
`;

export const BVM_INIT_FISH_TEMPLATE = String.raw`# bvm-init.fish: Initializes bvm default version on shell startup

# Check if BVM_DIR is set
if not set -q BVM_DIR
  return
end

# Try to switch to the 'default' version silently.
# Errors are suppressed to prevent blocking shell startup.
eval "$BVM_DIR/bin/bvm" use default --silent >/dev/null 2>&1 || true
`;;
