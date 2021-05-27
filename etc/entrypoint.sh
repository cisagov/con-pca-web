#!/bin/bash
echo "Substituting settings"
envsubst < /usr/share/nginx/html/assets/settings.template.json > /usr/share/nginx/html/assets/settings.json

echo "Running Con-PCA version $VERSION"

echo "Starting nginx"
exec nginx -g 'daemon off;'
