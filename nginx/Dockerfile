FROM nginx:alpine

# Render config from env at container start (PaaS + VPS + Compose friendly).
# nginx official image auto-renders /etc/nginx/templates/*.template via envsubst.
COPY default.conf.template /etc/nginx/templates/default.conf.template
