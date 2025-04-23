ARG BUILD_FROM
FROM $BUILD_FROM

# Set shell
SHELL ["/bin/bash", "-o", "pipefail", "-c"]

# Setup base
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        nodejs \
        npm

# Copy data for add-on
COPY rootfs /

# Copy application files
COPY app /app

# Install Node.js dependencies
RUN cd /app && npm install

WORKDIR /app

# Expose ports (if your app needs any)
# EXPOSE 8080

CMD [ "/run.sh" ]
