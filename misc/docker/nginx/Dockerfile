FROM nginx:mainline-alpine-slim

RUN apk add --no-cache logrotate fail2ban iptables bash

#Logrotate
COPY app/logrotate.d/logrotate.conf /etc/logrotate.conf
RUN chmod 644 /etc/logrotate.conf

#Nginx
COPY app/nginx /etc/nginx
COPY app/start.sh /opt/nginx/start.sh
RUN chmod +x /opt/nginx/

CMD ["/opt/nginx/start.sh"]
