# https://github.com/elastic/kibana-docker
FROM docker.elastic.co/kibana/kibana-oss:6.2.3

USER root
RUN yum -y install wget curl && yum clean all

RUN sh -c "curl https://raw.githubusercontent.com/kadwanev/retry/master/retry -o /usr/local/bin/retry && chmod +x /usr/local/bin/retry"

# Add your kibana plugins setup here
# Example: RUN kibana-plugin install <name|url>

RUN wget https://github.com/stedolan/jq/releases/download/jq-1.5/jq-linux64 -O /tmp/jq
RUN chmod +x /tmp/jq
RUN mv /tmp/jq /usr/local/bin

USER kibana

COPY app/scripts /opt/scripts
COPY app/kibana.yml /usr/share/kibana/config/kibana.yml






