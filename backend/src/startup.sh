
source /home/sydney/pith-api/env/bin/activate
export PYTHONPATH=/home/sydney/pith-api:
sudo systemctl restart mongodb
redis-server
arq worker.WorkerSettings &
