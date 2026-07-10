FROM node:24.12.0-trixie-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends procps \
  && rm -rf /var/lib/apt/lists/*

RUN npm install pm2 -g --verbose

COPY package.json package-lock.json /tmp/
RUN cd /tmp \
  && npm ci --loglevel verbose --omit=dev \
  && mkdir -p /opt/anotea/backend \
  && mv /tmp/node_modules /opt/anotea/backend/

RUN groupmod -g 1500 node \
  && usermod -u 1500 -g 1500 node
USER 1500

COPY ./ /opt/anotea/backend

WORKDIR /opt/anotea/backend

CMD ["pm2-runtime", "index.js"]
