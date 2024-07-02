#!/usr/bin/env bash

mkdir -p /data/log
touch /data/log/error.log
touch /data/log/access.log

nginx && service fail2ban start && tail -f /data/log/*.log
