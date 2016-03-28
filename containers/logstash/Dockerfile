FROM logstash:2.1

MAINTAINER Marc Rudolph <marc.a.rudolph@gmail.com>

CMD ["logstash", "-f", "/config-dir/"]

RUN /opt/logstash/bin/plugin install logstash-filter-prune
RUN /opt/logstash/bin/plugin install logstash-filter-environment

ADD ./config-dir /config-dir