#!/bin/bash
cd /app || exit

# Update node to latest version for ng build to work
# Only a temporary solution until we can support multi-stage builds
apt install nodejs -y
curl https://raw.githubusercontent.com/creationix/nvm/master/install.sh | bash
# Disabling shellcheck here as we don't have the file, but is there.
# shellcheck disable=SC1091
source /root/.profile
nvm install node

# Build is ran at runtime, so cognito config can be defined by environment variables
ng build --configuration production --output-path=/usr/share/nginx/html/ || exit

echo "Substituting settings"
envsubst < /usr/share/nginx/html/assets/settings.template.json > /usr/share/nginx/html/assets/settings.json

echo "Running Con-PCA version $VERSION"

echo "Starting nginx"
exec nginx -g 'daemon off;'
