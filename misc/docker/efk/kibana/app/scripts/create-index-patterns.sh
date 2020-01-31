#!/usr/bin/env bash

set -euo pipefail

readonly BASE_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"

function create_indexes() {
    local kibana_url="${1}"
    local index_name="${2}"
    local index_pattern="${index_name}-*"
    local id="${index_name}-*"
    local time_field="@timestamp"

    retry --tries 25 "curl -XGET ${kibana_url}/status -I | grep HTTP | grep '200 OK'"

    echo "Creating index pattern ${index_pattern}"
    curl -X POST "${kibana_url}/api/saved_objects/index-pattern/$id" -H "Content-Type: application/json" -H "kbn-xsrf: anything" \
        -d"{\"attributes\":{\"title\":\"${index_pattern}\",\"timeFieldName\":\"$time_field\"}}" | jq -C '.'
}

function set_default_index() {
    local kibana_url="${1}"
    local index_name="${2}"
    local id="${index_name}-*"

    echo "Making ${index_name} the default index"
    curl -XPOST "${kibana_url}/api/kibana/settings/defaultIndex" -H "Content-Type: application/json" -H "kbn-xsrf: anything"\
        -d"{\"value\":\"$id\"}"  | jq -C '.'
}

function __main() {
    local kibana_url="${1:-"http://localhost:5601"}"

    create_indexes "${kibana_url}" backend
    create_indexes "${kibana_url}" cpu
    create_indexes "${kibana_url}" job
    create_indexes "${kibana_url}" memory
    create_indexes "${kibana_url}" mongodb
    create_indexes "${kibana_url}" smtp
    set_default_index "${kibana_url}" backend
}

__main "$@"
