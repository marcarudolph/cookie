FROM baseimage

MAINTAINER Marc Rudolph <marc.a.rudolph@gmail.com>

# Java
RUN \
  echo debconf shared/accepted-oracle-license-v1-1 select true | debconf-set-selections && \
  echo debconf shared/accepted-oracle-license-v1-1 seen true | debconf-set-selections && \
  apt-get update && \
  apt-get install -y software-properties-common && \
  add-apt-repository -y ppa:webupd8team/java && \
  apt-get update && \
  apt-get install -y oracle-java7-installer

# ElasticSearch
RUN \
  cd /tmp && \
  wget https://download.elasticsearch.org/elasticsearch/elasticsearch/elasticsearch-1.4.1.tar.gz && \
  tar xvzf elasticsearch-1.4.1.tar.gz && \
  rm -f elasticsearch-1.4.1.tar.gz && \
  mv /tmp/elasticsearch-1.4.1 /elasticsearch


VOLUME /elasticsearch/data
VOLUME /elasticsearch/logs

EXPOSE 9200
EXPOSE 9300

CMD ["/elasticsearch/bin/elasticsearch"]

ADD ./elasticsearch.yml /elasticsearch/config/elasticsearch.yml
