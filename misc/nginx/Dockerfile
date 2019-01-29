FROM nginx:latest

RUN apt-get update \
    && apt-get install -y logrotate

COPY app/logrotate.d/nginx /etc/logrotate.d/nginx
COPY app/nginx /etc/nginx
COPY app/start.sh /opt/nginx/start.sh
RUN chmod +x /opt/nginx/start.sh

CMD ["/opt/nginx/start.sh"]
