#!/bin/bash

cd /home/sydney/pith-api
source env/bin/activate
export PYTHONPATH=/home/sydney/pith-api:$PYTHONPATH
sudo systemctl start mongodb
redis-server
