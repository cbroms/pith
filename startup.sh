#!/bin/bash

# run this script as ". startup.sh"

source $(pwd)/env/bin/activate
export PYTHONPATH=/home/sydney/pith-api:$PYTHONPATH
sudo systemctl start mongodb
redis-server
arq worker.WorkerSettings &

