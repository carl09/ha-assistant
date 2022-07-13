ARG BUILD_FROM
FROM $BUILD_FROM

ENV LANG C.UTF-8

RUN apk add --no-cache nodejs npm

ADD www/ /www/

WORKDIR www

ENV NODE_ENV production

RUN npm install --only=production

# CMD [ "/run.sh" ]
CMD ["node", "server/index.js"]
