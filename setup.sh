#!/bin/bash

# Following works for Ubuntu 18.04

echo "#!/bin/bash" > src/startup.sh
echo "" > src/startup.sh

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
echo "source $(pwd)/env/bin/activate" >> src/startup.sh
pip install -r requirements.txt
echo "export PYTHONPATH=$(pwd):$PYTHONPATH" >> src/startup.sh

# Just do this to get mongodb: https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/
echo "sudo systemctl restart mongodb" >> src/startup.sh

# redis
sudo apt-get install redis-server
echo "redis-server" >> src/startup.sh

# arq
echo "arq worker.WorkerSettings &" >> src/startup.sh

# open port for development
sudo ufw allow 8080

# automate start-up script
chmod +x src/startup.sh

# .env file
echo "Remember to make a .env file with REDIS_IP, REDIS_PORT, MONGO_CONN."
