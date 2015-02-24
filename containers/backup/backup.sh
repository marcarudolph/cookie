#/bin/bash
DATE=$(date +"%Y%m%d_%H%M")
TMP_DIR="/tmp"
BKP_FILE="$TMP_DIR/cookiedb_$DATE.tar.gz"
DUMP_DIR="/cookie/backup"
DROPBOX_UPLOADER_CFG="/cfg/.dropbox_uploader"
PICS_SOURCE_PATH="/cookie/pics"
THUMBNAILS_SOURCE_PATH="/cookie/pics/thumbnails"

#Backup Database
curl -XPUT "http://es:9242/_snapshot/cookie_backup/$DATE?wait_for_completion=true" -d  '{"indices": "cookie"}'
tar -zcvf $BKP_FILE $DUMP_DIR
dropbox_uploader.sh -f $DROPBOX_UPLOADER_CFG upload "$BKP_FILE" "/db/"

#Backup Pics
DROPBOX_FILE_LIST=$(dropbox_uploader.sh -s -f $DROPBOX_UPLOADER_CFG list "/pics" | grep -F '[F]' | awk '{print $3}')
declare -A DROPBOX_FILES
for f in $DROPBOX_FILE_LIST
do
	DROPBOX_FILES[$f]=1
done
cd $PICS_SOURCE_PATH
for f in $(ls -1 *.jpg)
do
	if [[ ! ${DROPBOX_FILES[$f]} ]]; then dropbox_uploader.sh -f $DROPBOX_UPLOADER_CFG upload "$PICS_SOURCE_PATH/$f" "/pics/"; fi;
done

#Backup Thumbnails
DROPBOX_FILE_LIST=$(dropbox_uploader.sh -s -f $DROPBOX_UPLOADER_CFG list "/pics/thumbnails" | grep -F '[F]' | awk '{print $3}')
declare -A DROPBOX_FILES
for f in $DROPBOX_FILE_LIST
do
	DROPBOX_FILES[$f]=1
done
cd $THUMBNAILS_SOURCE_PATH
for f in $(ls -1 *.jpg)
do
	if [[ ! ${DROPBOX_FILES[$f]} ]]; then dropbox_uploader.sh -f $DROPBOX_UPLOADER_CFG upload "$THUMBNAILS_SOURCE_PATH/$f" "/pics/thumbnails"; fi;
done
