FROM basenode

MAINTAINER Marc Rudolph <marc.a.rudolph@gmail.com>

EXPOSE 8088

ADD ./server/package.json /cookie/server/package.json
RUN cd /cookie/server && npm install

ADD . /cookie

WORKDIR /cookie/server

CMD ["node", "/cookie/server/server.js"]
