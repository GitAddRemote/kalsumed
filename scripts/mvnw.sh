#!/usr/bin/env bash
set -euo pipefail
IMG="maven:3.9-eclipse-temurin-21"
docker run --rm -it -v "$PWD":/ws -w /ws -v "$HOME/.m2":/root/.m2 ${IMG} mvn "$@"
