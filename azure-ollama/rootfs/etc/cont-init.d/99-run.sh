#!/usr/bin/with-contenv bashio
# ==============================================================================
# Community Hass.io Add-ons: Azure Ollama
# Executes the Node.js application.
# ==============================================================================
bashio::log.info "Starting Azure Ollama Node.js application..."

node /app/server.js
