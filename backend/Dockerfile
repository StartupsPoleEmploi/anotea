FROM node:24.12.0-trixie-slim

RUN npm install pm2 -g --verbose

COPY package.json package-lock.json /tmp/
RUN cd /tmp && npm ci --loglevel verbose && mkdir -p /opt/anotea/backend && mv /tmp/node_modules /opt/anotea/backend/

USER 1000

COPY ./ /opt/anotea/backend

WORKDIR /opt/anotea/backend

CMD ["pm2-runtime", "index.js"]
