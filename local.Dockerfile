FROM nginx:1.19

WORKDIR /app

RUN apt update -y
RUN apt install npm -y

COPY ./src/AdminUI/package.json ./

ENV NODE_OPTIONS="--max-old-space-size=8192"

RUN npm install --loglevel=error
RUN npm install -g @angular/cli

ENV PATH /app/node_modules/.bin:$PATH

COPY ./src/AdminUI .
RUN ng build
CMD ng serve --host 0.0.0.0 --disable-host-check
