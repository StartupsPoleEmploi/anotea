#!/usr/bin/env bash

mkdir -p /data/log
touch /data/log/error.log
touch /data/log/access.log

#Starting cron service to enable logrotate daily job
$(which service) cron start

nginx && tail -f /data/log/*.log
