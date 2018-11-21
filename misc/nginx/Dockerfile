FROM nginx:latest

COPY app/nginx /etc/nginx
COPY app/start.sh /opt/nginx/start.sh
RUN chmod +x /opt/nginx/start.sh

CMD ["/opt/nginx/start.sh"]
