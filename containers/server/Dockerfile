FROM basenode

MAINTAINER Marc Rudolph <marc.a.rudolph@gmail.com>

EXPOSE 8088

RUN apt-get install -y software-properties-common python-software-properties \
	&& add-apt-repository -y ppa:dhor/myway \
	&& apt-get update \
	&& apt-get install -y graphicsmagick

ADD ./server/package.json /cookie/server/package.json
RUN cd /cookie/server && npm install

ADD . /cookie

WORKDIR /cookie/server

CMD ["node", "/cookie/server/server.js"]
