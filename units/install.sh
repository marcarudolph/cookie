#!/bin/bash

sudo cp cbackup.service /etc/systemd/system/
sudo cp cbackup.timer /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable cbackup.timer