#!/usr/bin/with-contenv bashio

node -v

npm -v

echo "Hello world!"

cd /www

npm ci --only=production --ignore-scripts
