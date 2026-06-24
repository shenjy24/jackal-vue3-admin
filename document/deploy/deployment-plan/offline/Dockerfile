ARG NGINX_IMAGE=nginx:1.30.2-alpine

FROM ${NGINX_IMAGE}

COPY dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
