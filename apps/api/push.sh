#!/bin/bash
CTIMS_API_CONTAINER_IMAGE_NAME=ctims-spi
CTIMS_API_CONTAINER_IMAGE_LOCATION=$TECHNA_REGISTRY_ENDPOINT:$TECHNA_REGISTRY_PORT/$CTIMS_API_CONTAINER_IMAGE_NAME

GIT_REF="$(git rev-parse @)"
GIT_BRANCH="$(git symbolic-ref --short HEAD)"
COMMIT_ISH="$(git describe --tags --all --always | grep --color=never -o -E '[^\/]+$' | sed "s/~/-/g")"

echo 'pushing backend...'
docker push ${CTIMS_API_CONTAINER_IMAGE_LOCATION}:latest
docker push ${CTIMS_API_CONTAINER_IMAGE_LOCATION}:$GIT_REF
docker push ${CTIMS_API_CONTAINER_IMAGE_LOCATION}:$COMMIT_ISH
