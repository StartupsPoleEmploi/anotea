FROM nginx:latest

RUN apt-get update \
    && apt-get install -y logrotate

COPY app/logrotate.d/logrotate.conf /etc/logrotate.conf
COPY app/nginx /etc/nginx

CMD nginx && tail -f /data/log/*.log
