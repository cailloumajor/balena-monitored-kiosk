# shellcheck shell=sh
xset s off -dpms &
node /usr/src/app >/dev/pts/0 2>&1
