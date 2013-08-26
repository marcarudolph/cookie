#!/usr/bin/env sh

C9_PORT=$COOKIE_C9_PORT
SCRIPT=$(readlink -f $0)
BASEDIR=$(dirname $SCRIPT)
ABSBASEDIR=$(readlink -f $BASEDIR)

forever start /var/www/cloud9/server.js -w $ABSBASEDIR -l 0.0.0.0 -p $COOKIE_C9_PORT -a x-www-browser --username $USER --password $COOKIE_C9_PWD
