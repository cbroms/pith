#!/bin/bash

# Following works for Ubuntu 18.04

# python3.8 https://linuxize.com/post/how-to-install-python-3-8-on-ubuntu-18-04/
sudo apt update
sudo apt install software-properties-common
sudo add-apt-repository ppa:deadsnakes/ppa
sudo apt install python3.8
python3.8 --version
sudo apt install python3.8-venv python3.8-dev

# virtual env
python3.8 -m venv env
source env/bin/activate
pip install -r requirements.txt

# redis
sudo apt-get install redis-server

# open port for development
sudo ufw allow 8080

# startup.sh file
echo "#!/bin/bash" > src/startup.sh
echo "" > src/startup.sh
echo "source $(pwd)/env/bin/activate" >> src/startup.sh
echo "export PYTHONPATH=$(pwd):$PYTHONPATH" >> src/startup.sh
echo "sudo systemctl restart mongodb" >> src/startup.sh
echo "redis-server" >> src/startup.sh
echo "arq worker.WorkerSettings &" >> src/startup.sh
chmod +x src/startup.sh

# .env file
echo "Remember to make a .env file with REDIS_IP, REDIS_PORT, MONGO_CONN."
