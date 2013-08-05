#!/usr/bin/env sh

C9_PORT=$COOKIE_C9_PORT
SCRIPT=$(readlink -f $0)
BASEDIR=$(dirname $SCRIPT)
ABSBASEDIR=$(readlink -f $BASEDIR)

nohup /var/www/cloud9/bin/cloud9.sh -l 0.0.0.0 -p $C9_PORT -w $ABSBASEDIR > /tmp/c9.log 2>&1 &