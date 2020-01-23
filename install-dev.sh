#!/usr/bin/env bash
set -e

cd api && yarn
cd ..
cd app && yarn
cd ..

# Build app and api containers
docker-compose -f docker/docker-compose.dev.yml build