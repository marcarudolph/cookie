FROM baseimage

MAINTAINER Marc Rudolph <marc.a.rudolph@gmail.com>

RUN apt-get -y install nginx

RUN mkdir /var/www && \
	mkdir /var/www/frontends && \
	chmod -R 775 /var/www/frontends

EXPOSE 80
EXPOSE 443
CMD ["nginx"]	

VOLUME /etc/nginx/aardvark-sites
VOLUME /var/log/nginx
VOLUME /var/www/frontends

ADD ./nginx.conf /etc/nginx/
