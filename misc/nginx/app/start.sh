#!/usr/bin/env bash

mkdir -p /data/log
touch /data/log/error.log
touch /data/log/access.log

nginx && tail -f /data/log/*.log
