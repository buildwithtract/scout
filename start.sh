#!/bin/sh
echo "Starting application with architecture: $(uname -m)"
echo "Environment: NODE_ENV=$NODE_ENV"
bun run start
