FROM baseimage

MAINTAINER Marc Rudolph <marc.a.rudolph@gmail.com>

RUN apt-get install -y curl

ADD https://raw.githubusercontent.com/andreafabrizi/Dropbox-Uploader/master/dropbox_uploader.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/dropbox_uploader.sh

VOLUME /cfg
VOLUME /cookie/pics
VOLUME /cookie/backup

ADD ./backup.sh /usr/local/bin

CMD ["backup.sh"]