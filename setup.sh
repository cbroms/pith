#!/bin/bash

pip install -r requirements.txt
PWD=$(pwd)
export PYTHONPATH=$PYTHONPATH+":"+PWD
