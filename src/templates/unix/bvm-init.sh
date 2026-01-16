#!/bin/bash

# bvm-init.sh: Initializes bvm default version on shell startup

# Check if BVM_DIR is set
if [ -z "${BVM_DIR}" ]; then
  return
fi

# Try to switch to the 'default' version silently.
"${BVM_DIR}/bin/bvm" use default --silent >/dev/null 2>&1 || true
