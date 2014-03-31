#/bin/bash

TMP_DIR="/tmp"
DATE=$(date +"%Y%m%d_%H%M")
BKP_FILE="$TMP_DIR/cookiedb_$DATE.tar"
DUMP_DIR="$TMP_DIR/dump"
SCRIPT=$(readlink -f "$0")
SCRIPTPATH=$(dirname "$SCRIPT")
DROPBOX_UPLOADER="$SCRIPTPATH/dropbox_uploader.sh"


#Backup Database
cd "$TMP_DIR"
mongodump

tar cf "$BKP_FILE" $DUMP_DIR
gzip "$BKP_FILE"

$DROPBOX_UPLOADER -f ~/.dropbox_uploader upload "$BKP_FILE.gz"

rm -fr "$BKP_FILE.gz"
rm -r "$DUMP_DIR"

#Backup Images
$DROPBOX_UPLOADER -s -f ~/.dropbox_uploader upload "/var/www/cookie/pictures/" "/picturebackup"

