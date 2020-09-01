FROM ubuntu:18.04

ENV LANG C.UTF-8

RUN add-apt-repository ppa:deadsnakes/ppa \
    && apt-get update \
    && apt-get install -y \
    build-essential \
    pkg-config \
    software-properties-common \
    python3.8 \
    python3.8-dev \
    python3.8-distutils

RUN python3.8 -m pip --no-cache-dir install --upgrade \
    pip \
    setuptools

# copy over the files used by the api
COPY / /api

# install the requirements 
RUN python3.8 -m pip install -r /api/requirements.txt

WORKDIR /api 

EXPOSE 8000

CMD [ "python3", "app.py" ]
