FROM node:12.22.12-stretch

RUN npm install -g --ignore-scripts forever

#Install and cache node_modules waiting for npm 6.1.1 to be able to use npm ci instead of npm install
COPY package.json package-lock.json /tmp/
RUN cd /tmp && npm --ignore-scripts ci && mkdir -p /opt/anotea/backend && mv /tmp/node_modules /opt/anotea/backend/

COPY ./ /opt/anotea/backend

WORKDIR /opt/anotea/backend

CMD ["forever", "index.js"]
