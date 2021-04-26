FROM nginx:1.19

WORKDIR /app

# Install build requirements
RUN apt update -y
RUN apt install npm -y
RUN npm install -g npm@latest
RUN npm install -g @angular/cli

# Install packages
COPY ./src/AdminUI/package*.json ./
ENV NODE_OPTIONS="--max-old-space-size=8192"
RUN npm install --loglevel=error
ENV PATH /app/node_modules/.bin:$PATH

# Copy source
COPY ./src/AdminUI .

# Build angular
RUN ng build

# Run angular
CMD ng serve --host 0.0.0.0 --disable-host-check
