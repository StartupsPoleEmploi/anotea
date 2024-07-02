FROM nginx:mainline

RUN apt-get update \
    && apt-get install -y logrotate \
    && apt-get -y install fail2ban iptables

#Logrotate
COPY app/logrotate.d/logrotate.conf /etc/logrotate.conf
RUN chmod 644 /etc/logrotate.conf

#Nginx
COPY app/nginx /etc/nginx
COPY app/start.sh /opt/nginx/start.sh
RUN chmod +x /opt/nginx/start.sh
    
CMD /opt/nginx/start.sh
