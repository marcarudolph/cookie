#!/usr/bin/env sh

SCRIPT=$(readlink -f $0)
BASEDIR=$(dirname $SCRIPT)
ABSBASEDIR=$(readlink -f $BASEDIR)

sudo /var/www/cloud9/bin/cloud9.sh -l 0.0.0.0 -p $COOKIE_C9_PORT -w $ABSBASEDIR