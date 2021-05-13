#!/usr/bin/env bash
set -e

exec gosu node-app startx -- -keeptty -nocursor -retro &>/dev/null
