FROM mhart/alpine-iojs:2.0

MAINTAINER Marc Rudolph <marc.a.rudolph@gmail.com>

EXPOSE 8088

RUN apk add graphicsmagick --update-cache --repository http://dl-4.alpinelinux.org/alpine/edge/testing/ --allow-untrusted

WORKDIR /cookie/server

CMD ["node", "/cookie/server/server.js"]

ADD ./server/package.json /cookie/server/package.json
RUN cd /cookie/server && npm install

ADD . /cookie
