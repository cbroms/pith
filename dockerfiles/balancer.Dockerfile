FROM haproxy:latest

COPY ./certs /certs

COPY haproxy.cfg /usr/local/etc/haproxy/haproxy.cfg