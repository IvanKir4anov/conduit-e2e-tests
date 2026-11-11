# syntax=docker/dockerfile:1.7
# Builds the upstream RealWorld Angular frontend at a pinned commit and serves it with nginx.
# The only change to upstream code: the hardcoded public API base is replaced with a
# same-origin `/api`, which nginx proxies to the local backend.

ARG FRONTEND_REPO=https://github.com/realworld-apps/angular-realworld-example-app.git
ARG FRONTEND_SHA=d426ec804f7d035c374aa4a1b48ecdb05a03eb02

FROM oven/bun:1 AS build
ARG FRONTEND_REPO
ARG FRONTEND_SHA
WORKDIR /app
ADD ${FRONTEND_REPO}#${FRONTEND_SHA} .

ARG INTERCEPTOR=src/app/core/interceptors/api.interceptor.ts
ARG UPSTREAM_API='https://api.realworld.show/api${req.url}'
ARG LOCAL_API='/api${req.url}'
RUN grep -qF "${UPSTREAM_API}" "${INTERCEPTOR}" \
      || { echo "Upstream API base not found in ${INTERCEPTOR}: patch is out of date" >&2; exit 1; } \
 && sed -i "s#https://api.realworld.show/api#/api#" "${INTERCEPTOR}" \
 && grep -qF "\`${LOCAL_API}\`" "${INTERCEPTOR}" \
      || { echo "Patched API base not found in ${INTERCEPTOR}" >&2; exit 1; }

RUN bun install --frozen-lockfile && bun run build \
 && if grep -rq "realworld.show" dist/; then echo "External API URL left in the build output" >&2; exit 1; fi

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/angular-conduit/browser /usr/share/nginx/html
