#!/bin/bash

# Following works for Ubuntu 18.04

echo "#!/bin/bash\r" > startup.sh

# python3.8 https://linuxize.com/post/how-to-install-python-3-8-on-ubuntu-18-04/
sudo apt update
sudo apt install software-properties-common
sudo add-apt-repository ppa:deadsnakes/ppa
sudo apt install python3.8
python3.8 --version
sudo apt install python3.8-venv python3.8-dev

# virtual env
python -m venv env
source env/bin/activate
echo "source $(pwd)/env/bin/activate" >> startup.sh
pip install -r requirements.txt
# TODO need to fix this line so keeps this syntax
echo "export PYTHONPATH=$(pwd):$PYTHONPATH" >> startup.sh

# Just do this to get mongodb: https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/
echo "sudo systemctl restart mongodb" >> startup.sh

# redis
sudo apt-get install redis-server
echo "redis-server" >> startup.sh

echo "arq worker.WorkerSettings &" >> startup.sh



# automate start-up script
chmod +x startup.sh
