FROM nginx:latest

RUN apt-get update \
    && apt-get install -y curl \
    && apt-get -y autoclean

#Install nodejs
ENV NVM_VERSION v0.35.1
ENV NODE_VERSION 12.13.1
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
RUN cd /tmp && npm ci && mkdir -p /opt/anotea/stats && mv /tmp/node_modules /opt/anotea/stats/

#Build project
COPY ./ /opt/anotea/stats
WORKDIR /opt/anotea/stats
RUN npm run build &&  mv build/* /usr/share/nginx/html

#Install site into nginx
COPY misc/nginx/default.conf /etc/nginx/conf.d/default.conf
WORKDIR /usr/share/nginx/html
