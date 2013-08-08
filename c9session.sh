#!/usr/bin/env sh

SCRIPT=$(readlink -f $0)
BASEDIR=$(dirname $SCRIPT)
ABSBASEDIR=$(readlink -f $BASEDIR)
$C9_PORT=$COOKIE_C9_PORT 

/var/www/cloud9/bin/cloud9.sh -l 0.0.0.0 -p 1506 -w $ABSBASEDIR
