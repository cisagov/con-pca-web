FROM node:17-alpine

# Set working directory
WORKDIR /app

# Install build requirements
RUN npm install -g npm@latest
RUN npm install -g @angular/cli

# Install Packages
COPY ./src/AdminUI/package*.json ./
RUN npm install

# Copy source
COPY ./src/AdminUI .

# Build angular
RUN ng build

# Serve
CMD ng serve --host 0.0.0.0 --disable-host-check
