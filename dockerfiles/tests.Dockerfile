FROM pith-api_common

RUN DEBIAN_FRONTEND="noninteractive" apt-get -y install tzdata
RUN apt-get update && \
    apt-get install -y \
      vim \
      python3-sphinx

ENV PYTHONPATH /api:

# for running quick dev server: python -m http.server 1234
EXPOSE 1234

WORKDIR /api
COPY setup/ setup/
RUN chmod +x setup/setup.sh
RUN ./setup/setup.sh

CMD [ "sleep", "infinity" ]
