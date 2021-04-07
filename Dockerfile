ARG VERSION=unspecified

FROM nginx:1.19

ARG VERSION
ENV VERSION=${VERSION}

LABEL org.opencontainers.image.vendor="Cybersecurity and Infrastructure Security Agency"
LABEL org.opencontainers.image.version=${VERSION}

WORKDIR /app

RUN apt update -y
RUN apt install npm -y

COPY ./src/AdminUI/package.json ./

RUN npm install

RUN npm install -g @angular/cli

COPY ./src/AdminUI .

COPY ./etc/default.conf /etc/nginx/conf.d/default.conf
COPY ./etc/mime.types /etc/nginx/mime.types

COPY ./etc/entrypoint.sh /usr/share/nginx/entrypoint.sh
RUN chmod 755 /usr/share/nginx/entrypoint.sh

ENTRYPOINT ["/usr/share/nginx/entrypoint.sh"]
