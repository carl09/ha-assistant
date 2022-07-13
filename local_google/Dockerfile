ARG BUILD_FROM
FROM $BUILD_FROM

ENV LANG C.UTF-8

RUN apk add --no-cache nodejs npm

RUN addgroup -S node && adduser -S node -G node

# COPY  ../package.json /www/
# COPY  ../package-lock.json /www/

# Copy data for add-on
# COPY server.js /
# COPY server.js.map /
# COPY run.sh /
# RUN chmod a+x /run.sh

ADD www/ /www/

WORKDIR www

ENV NODE_ENV production

# RUN npm install --only=production --ignore-scripts
RUN npm install --only=production

USER node

# CMD [ "/run.sh" ]
CMD ["node", "server/index.js"]
