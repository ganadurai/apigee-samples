#!/bin/bash

# Copyright 2023 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

if [ -z "$PROJECT_ID" ]; then
    echo "No PROJECT_ID variable set"
    exit
fi

if [ -z "$APIGEE_ENV" ]; then
    echo "No APIGEE_ENV variable set"
    exit
fi

if [ -z "$APIGEE_HOST" ]; then
    echo "No APIGEE_HOST variable set"
    exit
fi

if [ -z "$GRAPHQL_ENDPOINT" ]; then
  gcloud config set project "$PROJECT_ID"

  gcloud services enable cloudbuild.googleapis.com artifactregistry.googleapis.com run.googleapis.com

  cd ${WORK_DIR}/graphql-server/source

  sed -i -e "s#ENV_HOSTNAME#$APIGEE_HOST#g" datasources/book-api.js
  sed -i -e "s#ENV_HOSTNAME#$APIGEE_HOST#g" datasources/author-api.js

  gcloud run deploy graphql-example-application1   \
    --region us-central1   \
    --port 4000 \
    --source .

  GRAPHQL_HOSTED_ENDPOINT=$(gcloud run services describe graphql-example-application1 --region us-central1 --format json | jq .status.url|cut -d '"' -f 2)
  export GRAPHQL_HOSTED_ENDPOINT;


  PROJECT_NUMBER="$(gcloud projects describe "${PROJECT_ID}" --format='get(projectNumber)')"

  gcloud iam service-accounts create cloudrun-invoker  --project="$PROJECT_ID" --display-name="Cloudrun Invoker"

  gcloud projects add-iam-policy-binding "${PROJECT_NUMBER}" \
  --member="serviceAccount:cloudrun-invoker@$PROJECT_ID.iam.gserviceaccount.com" \
  --role=roles/run.invoker

  sleep 10

  URL_CONTENT="<Authentication><GoogleIDToken><Audience useTargetUrl=\"true\"/></GoogleIDToken></Authentication><URL>$GRAPHQL_HOSTED_ENDPOINT</URL>"
  sed -i -e "s#<URL>.*</URL>#$URL_CONTENT#g" ${WORK_DIR}/apiproxies/apiproxy/targets/default.xml
else
  sed -i -e "s#<URL>.*</URL>#<URL>$GRAPHQL_ENDPOINT</URL>#g" ${WORK_DIR}/apiproxies/apiproxy/targets/default.xml
fi

cd "${WORK_DIR}"

TOKEN=$(gcloud auth print-access-token)

echo "Installing dependencies"

echo "Installing apigeecli"
curl -s https://raw.githubusercontent.com/apigee/apigeecli/master/downloadLatest.sh | bash
export PATH=$PATH:$HOME/.apigeecli/bin

echo "Uploading Apigee artifacts..."

echo "Importing and Deploying authors api source proxy..."
REV=$(apigeecli apis create bundle -p apiproxies/graphql-sample-api-source-authors.zip -n graphql-sample-api-source-authors --org "$PROJECT_ID" --token "$TOKEN" --disable-check | jq ."revision" -r)
apigeecli apis deploy --wait --name graphql-sample-api-source-authors --ovr --rev "$REV" --org "$PROJECT_ID" --env "$APIGEE_ENV" --token "$TOKEN" 

echo "Importing and Deploying books api source proxy..."
REV=$(apigeecli apis create bundle -p apiproxies/graphql-sample-api-source-books.zip -n graphql-sample-api-source-books --org "$PROJECT_ID" --token "$TOKEN" --disable-check | jq ."revision" -r)
apigeecli apis deploy --wait --name graphql-sample-api-source-books --ovr --rev "$REV" --org "$PROJECT_ID" --env "$APIGEE_ENV" --token "$TOKEN" 

echo "Importing Apigee graphql-basic-proxy proxy..."
REV=$(apigeecli apis create bundle -f apiproxies/apiproxy  -n graphql-basic-proxy --org "$PROJECT_ID" --token "$TOKEN" --disable-check | jq ."revision" -r)

echo "Deploying Apigee graphql-basic-proxy proxy..."

if [ -z "$GRAPHQL_ENDPOINT" ]; then
  # With service account passed in
  apigeecli apis deploy --wait --name graphql-basic-proxy --ovr --rev "$REV" --org "$PROJECT_ID" --env "$APIGEE_ENV" --token "$TOKEN" --sa "cloudrun-invoker@$PROJECT_ID.iam.gserviceaccount.com"
else
  apigeecli apis deploy --wait --name graphql-basic-proxy --ovr --rev "$REV" --org "$PROJECT_ID" --env "$APIGEE_ENV" --token "$TOKEN" 
fi

export MGMT_HOST="https://apigee.googleapis.com"

echo "Set up Apigee Product Gold"
curl -H "Authorization: Bearer ${TOKEN}"   -H "Content-Type:application/json"   "${MGMT_HOST}/v1/organizations/${PROJECT_ID}/apiproducts" -d \
    '{
        "name": "graphql-demo-product-gold",
        "displayName": "graphql-demo-product-gold",
        "approvalType": "auto",
        "attributes": [
            {
            "name": "access",
            "value": "private"
            },
            {
              "name": "scope",
              "value": "books.partner"
            }
        ],
        "description": "API Product for demoing GraphQL with Scope attribute set for full access",
        "environments": [
            "'"${APIGEE_ENV}"'"
        ],
        "operationGroup": {
            "operationConfigs": [
                {
                    "apiSource": "graphql-basic-proxy",
                    "operations": [
                    {
                        "resource": "/"
                    }
                    ],
                    "quota": {}
                }
            ]
        },
        "graphqlOperationGroup": {
          "operationConfigs": [
            {
              "apiSource": "graphql-basic-proxy",
              "operations": [
                {
                  "operationTypes": [
                    "query"
                  ],
                  "operation": "op_query"
                }
              ],
              "quota": {
                "limit": "10",
                "interval": "1",
                "timeUnit": "minute"
              },
              "attributes": [
                {
                  "name": "scope",
                  "value": "books.partner"
                }
              ]
            }
          ],
          "operationConfigType": "proxy"
        }
    }'

echo "Set up Apigee Product Bronze"
curl -H "Authorization: Bearer ${TOKEN}"   -H "Content-Type:application/json"   "${MGMT_HOST}/v1/organizations/${PROJECT_ID}/apiproducts" -d \
    '{
        "name": "graphql-demo-product-bronze",
        "displayName": "graphql-demo-product-bronze",
        "approvalType": "auto",
        "attributes": [
            {
            "name": "access",
            "value": "private"
            },
            {
              "name": "scope",
              "value": "books.partner"
            }
        ],
        "description": "API Product for demoing GraphQL with Scope attribute set for full access",
        "environments": [
            "'"${APIGEE_ENV}"'"
        ],
        "operationGroup": {
            "operationConfigs": [
                {
                    "apiSource": "graphql-basic-proxy",
                    "operations": [
                    {
                        "resource": "/"
                    }
                    ],
                    "quota": {}
                }
            ]
          },
        "graphqlOperationGroup": {
          "operationConfigs": [
            {
              "apiSource": "graphql-basic-proxy",
              "operations": [
                {
                  "operationTypes": [
                    "query"
                  ],
                  "operation": "op_query"
                }
              ],
              "quota": {
                "limit": "5",
                "interval": "1",
                "timeUnit": "minute"
              },
              "attributes": [
                {
                  "name": "scope",
                  "value": "books.reader"
                }
              ]
            }
          ],
          "operationConfigType": "proxy"
        }
      }'

echo "Set up Apigee Developer"

curl -H "Authorization: Bearer ${TOKEN}"   -H "Content-Type:application/json"   "${MGMT_HOST}/v1/organizations/${PROJECT_ID}/developers" -d \
    '{
    "email": "graphql-consumer-developer@google.com",
    "firstName": "GraphQL",
    "lastName": "Consumer",
    "userName": "graphql-consumer"
    }'

echo 'Set up developer app for the Product graphql-demo-product-gold'

curl -H "Authorization: Bearer ${TOKEN}"   -H "Content-Type:application/json"   "${MGMT_HOST}/v1/organizations/${PROJECT_ID}/developers/graphql-consumer-developer@google.com/apps" -d \
    '{
    "name":"graphql-consumer-gold-app",
    "apiProducts": [
        "graphql-demo-product-gold"
        ]
    }'
curl -H "Authorization: Bearer ${TOKEN}"   -H "Content-Type:application/json"   "${MGMT_HOST}/v1/organizations/${PROJECT_ID}/developers/graphql-consumer-developer@google.com/apps" -d \
    '{
    "name":"graphql-consumer-bronze-app",
    "apiProducts": [
        "graphql-demo-product-bronze"
        ]
    }'

printf "\nExtract the consumer key"
GOLD_CONSUMER_KEY=$(curl -s -H "Authorization: Bearer ${TOKEN}"  \
    -H "Content-Type:application/json" \
    "${MGMT_HOST}/v1/organizations/${PROJECT_ID}/developers/graphql-consumer-developer@google.com/apps/graphql-consumer-gold-app" | \
    jq '.credentials[0].consumerKey'); \
    GOLD_CONSUMER_KEY=$(echo "$GOLD_CONSUMER_KEY"|cut -d '"' -f 2); export GOLD_CONSUMER_KEY;
BRONZE_CONSUMER_KEY=$(curl -s -H "Authorization: Bearer ${TOKEN}"  \
    -H "Content-Type:application/json" \
    "${MGMT_HOST}/v1/organizations/${PROJECT_ID}/developers/graphql-consumer-developer@google.com/apps/graphql-consumer-bronze-app" | \
    jq '.credentials[0].consumerKey'); \
    BRONZE_CONSUMER_KEY=$(echo "$BRONZE_CONSUMER_KEY"|cut -d '"' -f 2); export BRONZE_CONSUMER_KEY;

export PROXY_URL="$APIGEE_HOST/v1/samples/graphql-basic-proxy"

echo " "
echo "All the Apigee artifacts are successfully deployed!"
echo " "
echo "Your Proxy URL is: https://$PROXY_URL"


echo "Introspect GraphQL schema via Apigee Endpoint for GOLD Consumer : "
echo "https://studio.apollographql.com/sandbox/explorer?endpoint=https://$PROXY_URL?apikey=$GOLD_CONSUMER_KEY"
echo " "

echo "Introspect GraphQL schema via Apigee Endpoint for BRONZE Consumer : "
echo "https://studio.apollographql.com/sandbox/explorer?endpoint=https://$PROXY_URL?apikey=$BRONZE_CONSUMER_KEY"
echo " "

