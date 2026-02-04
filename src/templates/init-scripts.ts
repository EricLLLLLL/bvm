// @ts-ignore
import BVM_INIT_SH_TEMPLATE from "./unix/bvm-init.sh" with { type: "text" };
// @ts-ignore
import BVM_INIT_FISH_TEMPLATE from "./unix/bvm-init.fish" with { type: "text" };
// @ts-ignore
import BVM_SHIM_SH_TEMPLATE from "./unix/bvm-shim.sh" with { type: "text" };

// @ts-ignore
import BVM_SHIM_JS_TEMPLATE from "./win/bvm-shim.js" with { type: "text" };
// @ts-ignore
import BVM_BUN_CMD_TEMPLATE from "./win/bun.cmd" with { type: "text" };
// @ts-ignore
import BVM_BUNX_CMD_TEMPLATE from "./win/bunx.cmd" with { type: "text" };
// @ts-ignore
import BVM_WRAPPER_CMD_TEMPLATE from "./win/bvm.cmd" with { type: "text" };
// @ts-ignore
import BVM_INIT_PS1_TEMPLATE from "./win/bvm-init.ps1" with { type: "text" };

export {
    BVM_INIT_SH_TEMPLATE,
    BVM_INIT_FISH_TEMPLATE,
    BVM_SHIM_SH_TEMPLATE,
    BVM_SHIM_JS_TEMPLATE,
    BVM_BUN_CMD_TEMPLATE,
    BVM_BUNX_CMD_TEMPLATE,
    BVM_WRAPPER_CMD_TEMPLATE,
    BVM_INIT_PS1_TEMPLATE
};
