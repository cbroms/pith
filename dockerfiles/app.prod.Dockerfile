FROM ubuntu:18.04

ENV LANG C.UTF-8

RUN apt-get update && \
    apt-get install -y software-properties-common && \
    rm -rf /var/lib/apt/lists/*
RUN add-apt-repository ppa:deadsnakes/ppa \
    && apt-get update \
    && apt-get install -y \
    build-essential \
    pkg-config \
    software-properties-common \
    python3.8 \
    python3.8-dev \
    python3.8-distutils \
    python3-pip

RUN python3.8 -m pip  install --upgrade \
    pip \
    setuptools

COPY backend/requirements.txt /api/requirements.txt

RUN python3.8 -m pip install -r /api/requirements.txt

COPY /backend/src /api 

WORKDIR /api

EXPOSE 8080

CMD [ "python3.8", "app.py" ]
