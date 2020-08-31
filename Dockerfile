FROM ubuntu:18.04

ENV LANG C.UTF-8

RUN apt-get update && apt-get install -y \
    build-essential \
    pkg-config \
    software-properties-common \
    python3 \
    python3-pip

RUN python3 -m pip --no-cache-dir install --upgrade \
    pip \
    setuptools

# copy over the files used by the api
COPY / /api

# install the requirements 
RUN python3 -m pip install -r /api/requirements.txt

WORKDIR /api 

EXPOSE 8000

CMD [ "uvicorn", "app:app", "--host", "0.0.0.0" ]