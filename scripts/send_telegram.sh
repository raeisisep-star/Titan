#!/usr/bin/env bash
set -euo pipefail

# Telegram configuration from environment
BOT_TOKEN="${TELEGRAM_BOT_TOKEN:-}"
CHAT_ID="${TELEGRAM_CHAT_ID:-}"
MSG="${1:-"(no message)"}"

# Exit silently if credentials not configured
[[ -z "$BOT_TOKEN" || -z "$CHAT_ID" ]] && exit 0

# Send message to Telegram
curl -sS -X POST "https://api.telegram.org/bot${BOT_TOKEN}/sendMessage" \
  -d chat_id="${CHAT_ID}" \
  -d text="$MSG" \
  -d parse_mode="HTML" >/dev/null 2>&1 || true

exit 0
