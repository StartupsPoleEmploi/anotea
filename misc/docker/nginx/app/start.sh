#!/usr/bin/env bash

mkdir -p /data/log
touch /data/log/error.log
touch /data/log/access.log

nginx && \
    (fail2ban-client reload || echo "reload not needed" && rm -f /var/run/fail2ban/fail2ban.sock) && \
    fail2ban-server -b && \
    tail -f /data/log/*.log