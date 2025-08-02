# docker/gateway/Dockerfile

FROM traefik:v2.11

# Static & dynamic config
COPY apps/gateway/traefik/traefik.yml   /etc/traefik/traefik.yml
COPY apps/gateway/traefik/dynamic/      /etc/traefik/dynamic/

# Expose HTTP + HTTPS
EXPOSE 80 443
CMD ["--configFile=/etc/traefik/traefik.yml"]

