FROM nginx:latest
ARG ANOTEA_GOOGLE_ANALYTICS_ID
ARG ANOTEA_HOTJAR_ID

RUN apt-get update \
    && apt-get install -y curl \
    && apt-get -y autoclean

#Install nodejs
ENV NVM_VERSION v0.34.0
ENV NODE_VERSION 10.14.1
ENV NVM_DIR /usr/local/nvm
ENV NODE_PATH $NVM_DIR/v$NODE_VERSION/lib/node_modules
ENV PATH $NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH
RUN mkdir $NVM_DIR \
    && curl -o- https://raw.githubusercontent.com/creationix/nvm/$NVM_VERSION/install.sh | bash \
    && echo "source $NVM_DIR/nvm.sh && \
        nvm install $NODE_VERSION && \
        nvm alias default $NODE_VERSION && \
        nvm use default" | bash

#Download npm dependencies
COPY package.json package-lock.json /tmp/
RUN cd /tmp && npm ci && mkdir -p /opt/anotea/backoffice && mv /tmp/node_modules /opt/anotea/backoffice/
COPY ./ /opt/anotea/backoffice
WORKDIR /opt/anotea/backoffice

#Build project
RUN REACT_APP_ANOTEA_GOOGLE_ANALYTICS_ID=${ANOTEA_GOOGLE_ANALYTICS_ID} \
    REACT_APP_ANOTEA_HOTJAR_ID=${ANOTEA_HOTJAR_ID} \
    npm run build &&  mv build/* /usr/share/nginx/html

#Install site into nginx
COPY misc/nginx/default.conf /etc/nginx/conf.d/default.conf
WORKDIR /usr/share/nginx/html
