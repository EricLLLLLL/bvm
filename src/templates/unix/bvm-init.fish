# bvm-init.fish: Initializes bvm default version on shell startup

# Check if BVM_DIR is set
if not set -q BVM_DIR
  return
end

function __bvm_normalize_path
    # Ensure correct priority: shims -> bin -> (existing PATH) -> current/bin
    fish_add_path -m "$BVM_DIR/shims"
    fish_add_path -m "$BVM_DIR/bin"
    fish_add_path --append -m "$BVM_DIR/current/bin"
end

__bvm_normalize_path

function bvm
    set -l subcmd ""
    if test (count $argv) -ge 1
        set subcmd $argv[1]
    end

    command "$BVM_DIR/bin/bvm" $argv
    set -l code $status

    switch $subcmd
        case use install i uninstall rehash default alias unalias setup deactivate
            __bvm_normalize_path
    end

    return $code
end
