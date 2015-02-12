FROM baseimage

MAINTAINER Marc Rudolph <marc.a.rudolph@gmail.com>

RUN apt-get -y install nginx

RUN mkdir /var/www && \
	mkdir /var/www/kopf && \
	chmod -R 775 /var/www/kopf && \
	mkdir /var/www/head && \
	chmod -R 775 /var/www/head

RUN apt-get -y install unzip

ADD https://github.com/lmenezes/elasticsearch-kopf/archive/1.2.zip /tmp/kopf.zip
RUN unzip /tmp/kopf.zip -d /var/www/kopf

ADD https://github.com/mobz/elasticsearch-head/archive/master.zip /tmp/head.zip
RUN unzip /tmp/head.zip -d /var/www/head

EXPOSE 8443
CMD ["nginx"]	

VOLUME /etc/nginx/aardvark-sites
VOLUME /var/log/nginx

ADD ./nginx.conf /etc/nginx/

