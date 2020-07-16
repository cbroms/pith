#!/bin/bash

python3 -m venv env
export PYTHONPATH=$(pwd):$PYTHONPATH
pip install -r requirements.txt

# sudo apt-get install mongodb
sudo service mongodb start

sudo apt-get install redis-server
redis-server
arq models.discussion_manager.WorkerSettings
