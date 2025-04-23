ARG BUILD_FROM
FROM $BUILD_FROM

ENV LANG C.UTF-8

RUN apk add --no-cache nodejs npm

COPY rootfs /

# RUN chmod a+x /etc/services.d/azure-ollama/run
# RUN chmod a+x /etc/services.d/azure-ollama/finish

COPY app /app

RUN cd /app && npm install

WORKDIR /app

# Expose ports (if your app needs any)
# EXPOSE 8080

# CMD [ "/run.sh" ]
