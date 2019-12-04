#!/usr/bin/env bash

set -euo pipefail

readonly BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

function check_system() {
    if ! [ -x "$(command -v pm2)" ]; then
        echo 'Error: pm2 is not installed.' >&2
        exit 1
    fi
}

function install_dependencies() {
    find . -type d -mindepth 1 -maxdepth 1 \( \
        -name "backend" \
        -o -name "backoffice" \
        -o -name "questionnaire" \
        -o -name "widget" \
        -o -name "stats" \) \
        -exec npm ci --prefix "{}" \;
}

function start_projects() {
    pm2 start dev.yml
}

function stop_projects() {
    pm2 stop dev.yml
}

function show_logs() {
    pm2 logs --raw
}

trap stop_projects EXIT HUP INT QUIT PIPE TERM
check_system
if [ -z ${SKIP_NPM_INSTALL+x} ]; then install_dependencies; else echo "Skipping npm install"; fi
start_projects
show_logs
