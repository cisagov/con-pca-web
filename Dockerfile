ARG VERSION=unspecified

FROM nginx:1.19

ARG VERSION
ENV VERSION=${VERSION}

LABEL org.opencontainers.image.vendor="Cybersecurity and Infrastructure Security Agency"
LABEL org.opencontainers.image.version=${VERSION}

# Set working directory
WORKDIR /app

# Install build requirements
RUN apt update -y
RUN apt install npm -y
RUN npm install -g npm@latest
RUN npm install -g @angular/cli

# Install packages
COPY ./src/AdminUI/package*.json ./
RUN npm install

# Copy source
COPY ./src/AdminUI .

# Copy nginx configuration
COPY ./etc/default.conf /etc/nginx/conf.d/default.conf
COPY ./etc/mime.types /etc/nginx/mime.types

# Copy entrypoint
COPY ./etc/entrypoint.sh /usr/share/nginx/entrypoint.sh
RUN chmod 755 /usr/share/nginx/entrypoint.sh

# Set entrypoint
ENTRYPOINT ["/usr/share/nginx/entrypoint.sh"]
