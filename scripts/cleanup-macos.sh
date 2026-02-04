#!/usr/bin/env bash
set -euo pipefail

START_MARKER='# >>> bvm initialize >>>'
END_MARKER='# <<< bvm initialize <<<'

YES=0
DRY_RUN=0
PURGE_BVM_DIR=0
PURGE_BUN=0

usage() {
  cat <<'EOF'
用法：
  scripts/cleanup-macos.sh [--yes] [--dry-run] [--purge-bvm-dir] [--purge-bun]

说明：
  - 默认只清理 shell 配置里的 bvm 初始化块（不会删除任何目录）。
  - --purge-bvm-dir 会删除 $BVM_DIR（默认 ~/.bvm）。
  - --purge-bun 会删除 ~/.bun（这会删除 bun 的全局包与缓存）。
EOF
}

for arg in "$@"; do
  case "$arg" in
    --yes) YES=1 ;;
    --dry-run) DRY_RUN=1 ;;
    --purge-bvm-dir) PURGE_BVM_DIR=1 ;;
    --purge-bun) PURGE_BUN=1 ;;
    -h|--help) usage; exit 0 ;;
    *)
      echo "未知参数: $arg" >&2
      usage
      exit 2
      ;;
  esac
done

HOME_DIR="${HOME:-}"
if [ -z "$HOME_DIR" ]; then
  echo "未检测到 HOME，无法继续。" >&2
  exit 1
fi

BVM_DIR="${BVM_DIR:-$HOME_DIR/.bvm}"

timestamp() { date +"%Y%m%d-%H%M%S"; }

confirm() {
  local msg="$1"
  if [ "$YES" -eq 1 ]; then
    return 0
  fi
  echo
  echo "⚠️ 危险操作检测！"
  echo "操作类型：$msg"
  echo "影响范围：可能修改 shell 配置/删除目录"
  echo "风险评估：可能导致 bvm/bun 全局工具不可用，需要重新安装"
  echo
  read -r -p "请确认是否继续？[输入 \"1\" 继续] " answer
  [ "$answer" = "1" ]
}

backup_file() {
  local file="$1"
  local bak="${file}.bak-$(timestamp)"
  if [ "$DRY_RUN" -eq 1 ]; then
    echo "[dry-run] 备份: \"$file\" -> \"$bak\""
    return 0
  fi
  cp "$file" "$bak"
  echo "已备份: \"$file\" -> \"$bak\""
}

remove_bvm_block() {
  local file="$1"
  [ -f "$file" ] || return 0

  if ! grep -qF "$START_MARKER" "$file"; then
    return 0
  fi

  backup_file "$file"

  if [ "$DRY_RUN" -eq 1 ]; then
    echo "[dry-run] 将从 \"$file\" 移除 bvm 初始化块"
    return 0
  fi

  # Remove all occurrences of the managed block (multiline, non-greedy).
  perl -0777 -i -pe "s/\\n?\\Q$START_MARKER\\E.*?\\Q$END_MARKER\\E\\n?/\\n/sg" "$file"
}

echo "BVM_DIR: \"$BVM_DIR\""

if ! confirm "清理 macOS shell 环境中的 bvm 初始化块"; then
  echo "已取消。"
  exit 1
fi

remove_bvm_block "$HOME_DIR/.zshrc"
remove_bvm_block "$HOME_DIR/.bashrc"
remove_bvm_block "$HOME_DIR/.bash_profile"
remove_bvm_block "$HOME_DIR/.profile"
remove_bvm_block "$HOME_DIR/.config/fish/config.fish"

if [ "$PURGE_BUN" -eq 1 ]; then
  if confirm "删除 \"$HOME_DIR/.bun\""; then
    if [ "$DRY_RUN" -eq 1 ]; then
      echo "[dry-run] rm -rf \"$HOME_DIR/.bun\""
    else
      rm -rf "$HOME_DIR/.bun"
      echo "已删除: \"$HOME_DIR/.bun\""
    fi
  fi
fi

if [ "$PURGE_BVM_DIR" -eq 1 ]; then
  if confirm "删除 \"$BVM_DIR\""; then
    if [ "$DRY_RUN" -eq 1 ]; then
      echo "[dry-run] rm -rf \"$BVM_DIR\""
    else
      rm -rf "$BVM_DIR"
      echo "已删除: \"$BVM_DIR\""
    fi
  fi
fi

cat <<EOF

完成。
建议：
  1) 重启终端，或执行：source ~/.zshrc && hash -r
  2) 验证：which bun / which bvm 不应指向 $BVM_DIR
EOF
