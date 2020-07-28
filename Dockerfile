FROM nginx:1.19

WORKDIR /app

RUN apt update -y
RUN apt install npm -y

COPY ./src/AdminUI/package.json ./

RUN npm install

RUN npm install -g @angular/cli

COPY ./src/AdminUI .

RUN apt install openssl

RUN mkdir /certs

RUN openssl req -x509 -nodes -days 365 -subj "/C=CA/ST=ID/O=INL/CN=localhost" -newkey rsa:2048 -keyout /certs/server.key -out /certs/server.crt

COPY ./etc/default.conf /etc/nginx/conf.d/default.conf
COPY ./etc/mime.types /etc/nginx/mime.types

COPY ./etc/entrypoint.sh /usr/share/nginx/entrypoint.sh
RUN chmod 755 /usr/share/nginx/entrypoint.sh

ENTRYPOINT ["/usr/share/nginx/entrypoint.sh"]
