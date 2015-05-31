FROM alpine:3.1

MAINTAINER Marc Rudolph <marc.a.rudolph@gmail.com>

RUN apk add --update curl bash

ADD https://raw.githubusercontent.com/andreafabrizi/Dropbox-Uploader/master/dropbox_uploader.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/dropbox_uploader.sh

VOLUME /cfg
VOLUME /cookie/pics
VOLUME /cookie/backup
CMD ["/bin/bash", "-c", "export OSTYPE='linux-gnu' && /usr/local/bin/backup.sh"]

ADD ./backup.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/backup.sh

