FROM mhart/alpine-node:4.2

MAINTAINER Marc Rudolph <marc.a.rudolph@gmail.com>

EXPOSE 8088
WORKDIR /cookie/server

CMD ["node", "/cookie/server/server.js"]

# Build Libvips / Sharp
RUN apk add --update curl bash build-base python glib-dev libxml2-dev pkgconfig tiff-dev libjpeg-turbo-dev libpng-dev libgsf-dev && \
	cd /tmp/ && \
	wget http://www.vips.ecs.soton.ac.uk/supported/current/vips-8.3.3.tar.gz && \
	tar -xzvf vips-8.3.3.tar.gz && \
	cd vips* && \
	./configure && \
	make && \
	make install && \
	cd .. && \
	rm -rf vips* && \
					\
	mkdir -p /tmp/sharpbuild && \
	cd /tmp/sharpbuild && \
	curl -s https://raw.githubusercontent.com/lovell/sharp/master/preinstall.sh | bash - && \
	export CPLUS_INCLUDE_PATH=/usr/local/include && \
	npm install --production --unsafe-perm sharp && \
					\
	apk add --update glib libxml2 pkgconfig tiff libjpeg-turbo libpng libgsf && \ 
	apk del curl bash build-base python glib-dev libxml2-dev pkgconfig tiff-dev libjpeg-turbo-dev libpng-dev libgsf-dev 

ADD ./server/package.json /cookie/server/package.json
RUN cd /cookie/server && \
	mv /tmp/sharpbuild/node_modules ./ && \
	npm install --production

ADD . /cookie
