#!/bin/bash

pip install -r requirements.txt
export PYTHONPATH=$(pwd):$PYTHONPATH
sudo service mongodb start
