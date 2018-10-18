#!/usr/bin/env bash

#Allow stderr of nginx process to be redirected to an error log file
nginx -g "daemon off;" 2> >(tee -a /var/log/nginx/all.log >&2)
