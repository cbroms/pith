FROM haproxy:latest

COPY cert.pem ./cert.pem

COPY haproxy.cfg /usr/local/etc/haproxy/haproxy.cfg