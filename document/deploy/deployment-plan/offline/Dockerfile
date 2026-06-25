ARG NGINX_IMAGE=nginx:1.30.2-alpine

FROM ${NGINX_IMAGE} AS runtime

ARG APP_UID=1000
ARG APP_GID=1000
ARG DIST_DIR=dist

WORKDIR /usr/share/nginx/html

RUN set -eux; \
    if ! getent group "${APP_GID}" >/dev/null; then addgroup -g "${APP_GID}" -S app; fi; \
    if ! getent passwd "${APP_UID}" >/dev/null; then \
        APP_GROUP="$(getent group "${APP_GID}" | cut -d: -f1)"; \
        adduser -S -D -H -h /nonexistent -s /sbin/nologin -u "${APP_UID}" -G "${APP_GROUP}" app; \
    fi; \
    mkdir -p /var/cache/nginx/client_temp \
             /var/cache/nginx/proxy_temp \
             /var/cache/nginx/fastcgi_temp \
             /var/cache/nginx/uwsgi_temp \
             /var/cache/nginx/scgi_temp \
             /var/run; \
    sed -i 's#^pid .*#pid /tmp/nginx.pid;#' /etc/nginx/nginx.conf; \
    chown -R "${APP_UID}:${APP_GID}" /var/cache/nginx /var/run /usr/share/nginx/html /etc/nginx/conf.d

COPY --chown=${APP_UID}:${APP_GID} ${DIST_DIR}/ /usr/share/nginx/html/
COPY --chown=${APP_UID}:${APP_GID} nginx.conf /etc/nginx/conf.d/default.conf

USER ${APP_UID}:${APP_GID}

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
