FROM node:12-alpine AS builder

ARG ANOTEA_ENV

RUN apk add --no-cache python3 make g++

COPY package.json package-lock.json /tmp/
RUN cd /tmp && npm ci --omit=dev --loglevel verbose

COPY ./ /opt/anotea/ui
WORKDIR /opt/anotea/ui
RUN mv /tmp/node_modules ./node_modules && \
    REACT_APP_ANOTEA_ENV=${ANOTEA_ENV} \
    npm run build --verbose -- --verbose

FROM nginx:mainline-alpine-slim

COPY --from=builder /opt/anotea/ui/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

WORKDIR /usr/share/nginx/html
