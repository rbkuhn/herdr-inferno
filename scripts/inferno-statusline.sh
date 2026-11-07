#!/bin/sh
# Claude Code statusLine for Herdr's Inferno layout: records Life (context left) and
# Mana (5-hour quota left) for the party cards. Prints nothing itself.
# To keep another statusline too, pipe "$input" into it below, e.g.:
#   printf '%s' "$input" | /path/to/your-statusline.sh
input=$(cat)
printf '%s' "$input" | node "$HOME/.config/herdr-app/scripts/inferno-record.mjs" >/dev/null 2>&1
exit 0
