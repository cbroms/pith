FROM pith-api_common

CMD [ "arq", "worker.worker.WorkerSettings" ]
