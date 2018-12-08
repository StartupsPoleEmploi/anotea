FROM node:10.14.1-stretch as builder

#Install and cache node_modules waiting for npm 6.1.1 to be able to use npm ci instead of npm install
COPY package.json package-lock.json /tmp/
RUN cd /tmp && npm ci && mkdir -p /opt/anotea/backoffice && mv /tmp/node_modules /opt/anotea/backoffice/

COPY ./ /opt/anotea/backoffice

WORKDIR /opt/anotea/backoffice
RUN npm run build

FROM nginx:latest
WORKDIR /usr/share/nginx/html
COPY --from=builder /opt/anotea/backoffice/build .
