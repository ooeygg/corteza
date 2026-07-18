# syntax=docker/dockerfile:1.7

# The production Coolify Compose deployment pulls the official image directly;
# this wrapper remains available for workflows that explicitly build a Dockerfile.
ARG CORTEZA_VERSION=2024.9.9-hotfix.1
FROM cortezaproject/corteza:${CORTEZA_VERSION}
