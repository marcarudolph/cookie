FROM mhart/alpine-node:0.12

MAINTAINER Marc Rudolph <marc.a.rudolph@gmail.com>

EXPOSE 8088
WORKDIR /cookie/server

CMD ["node", "/cookie/server/server.js"]

# Build LWIP
RUN apk add --update build-base python && \
	mkdir -p /tmp/lwipbuild && \
	cd /tmp/lwipbuild && \
	npm install --production lwip && \
	rm -rf npm* && \
	rm -rf node_modules/lwip/src && \
	rm -rf node_modules/lwip/tests && \
	rm -rf node_modules/lwip/examples && \
	apk del build-base python

ADD ./server/package.json /cookie/server/package.json
RUN cd /cookie/server && \
	mv /tmp/lwipbuild/node_modules ./ && \
	npm install --production

ADD . /cookie
