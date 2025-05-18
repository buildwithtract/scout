FROM golang:1.24-alpine AS goose-builder
RUN go install github.com/pressly/goose/v3/cmd/goose@latest

FROM oven/bun:1.2.13 AS builder
WORKDIR /app
ENV NEXT_PUBLIC_GIT_SHA=$KAMAL_VERSION
ARG NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
ENV NODE_ENV=production
COPY package.json /app
COPY tsconfig.json /app
COPY bun.lock /app
RUN bun install --frozen-lockfile
COPY . /app

# Mount the secrets and export them as environment variables
RUN --mount=type=secret,id=NEXT_PUBLIC_GOOGLE_MAPS_API_KEY \
    --mount=type=secret,id=DNOS_ENW_API_KEY \
    --mount=type=secret,id=DNOS_UKPN_API_KEY \
    --mount=type=secret,id=DNOS_NGED_API_KEY \
    --mount=type=secret,id=DNOS_NPG_API_KEY \
    --mount=type=secret,id=DNOS_SPEN_API_KEY \
    --mount=type=secret,id=DNOS_SSEN_API_KEY \
    export NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=$(cat /run/secrets/NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) && \
    export DNOS_ENW_API_KEY=$(cat /run/secrets/DNOS_ENW_API_KEY) && \
    export DNOS_UKPN_API_KEY=$(cat /run/secrets/DNOS_UKPN_API_KEY) && \
    export DNOS_NGED_API_KEY=$(cat /run/secrets/DNOS_NGED_API_KEY) && \
    export DNOS_NPG_API_KEY=$(cat /run/secrets/DNOS_NPG_API_KEY) && \
    export DNOS_SPEN_API_KEY=$(cat /run/secrets/DNOS_SPEN_API_KEY) && \
    export DNOS_SSEN_API_KEY=$(cat /run/secrets/DNOS_SSEN_API_KEY) && \
    bun run build --debug

FROM oven/bun:1.2.13 AS runner
WORKDIR /app
RUN apt-get update && apt-get install -y gdal-bin make tmux
COPY --from=builder /app /app
ARG KAMAL_VERSION
ENV NEXT_PUBLIC_GIT_SHA=$KAMAL_VERSION
ARG NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
ENV NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=$NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
ENV NODE_ENV=production
ENV PORT=80

COPY --from=goose-builder /go/bin/goose /usr/local/bin/goose

EXPOSE 80
COPY start.sh /app/start.sh
# Dummy .env so so Makefile's include .env doesn't fail
RUN touch /app/.env
RUN chmod +x /app/start.sh
CMD ["/app/start.sh"]