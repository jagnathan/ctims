#!/bin/bash
source ./vars.sh
set -a
. /etc/environment
set +a

FQIN="ctims-${GIT_BRANCH_SAFE}"

eval "helm upgrade --debug \
--set docker.registry.endpoint=$TECHNA_REGISTRY_ENDPOINT:$TECHNA_REGISTRY_PORT \
--set docker.image=$CTIMS_WEB_CONTAINER_IMAGE_LOCATION \
--set docker.dbImage=$CTIMS_DB_CONTAINER_IMAGE_LOCATION \
--set docker.apiImage=$CTIMS_API_CONTAINER_IMAGE_LOCATION \
--set ctimsapi.keycloak.url=$KEYCLOAK_URL \
--set ctimsapi.keycloak.realm=$KEYCLOAK_REALM \
--set ctimsapi.keycloak.clientId=$KEYCLOAK_CLIENT_ID \
--set ctimsapi.keycloak.clientUUID=$KEYCLOAK_CLIENT_UUID \
--set ctimsapi.keycloak.clientSecret=$KEYCLOAK_CLIENT_SECRET \
--set ctimsapi.keycloak.adminClientId=$KEYCLOAK_ADMIN_CLIENT_ID \
--set ctimsapi.keycloak.adminClientSecret=$KEYCLOAK_ADMIN_CLIENT_SECRET \
--set ctimsapi.keycloak.tokenEndpoint=$KEYCLOAK_TOKEN_ENDPOINT \
--set ctimsapi.prismaEncryptionKey=$PRISMA_FIELD_ENCRYPTION_KEY \
--set ctimsEnv=$CTIMS_ENV \
--set git.branch=$GIT_COMMIT_ISH \
--set git.ref=$GIT_REF \
--set git.is_clean=$GIT_IS_CLEAN \
--set domain=$TECHNA_HOSTNAME \
--set app=\"ctims\" \
--set domain=$TECHNA_HOSTNAME \
$FQIN $SELFDIR"
