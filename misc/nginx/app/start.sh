#!/usr/bin/env bash

nginx -g "daemon off;" > >(tee -a /var/log/nginx/access.log) 2> >(tee -a /var/log/nginx/error.log >&2)
