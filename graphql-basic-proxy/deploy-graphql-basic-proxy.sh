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

if [ -z "$PROJECT" ]; then
    echo "No PROJECT variable set"
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

STATIC_GRAPHQL_ENDPOINT="https://apollo-fullstack-tutorial.herokuapp.com/graphql";

if [ -z "$GRAPHQL_HOSTED" ]; then
  if [ -z "$GRAPHQL_ENDPOINT" ]; then
    export GRAPHQL_ENDPOINT=$STATIC_GRAPHQL_ENDPOINT
  else
    sed -i -e "s#<URL>.*</URL>#<URL>$GRAPHQL_ENDPOINT</URL>#g" apiproxy/targets/default.xml
  fi
else
  # GraphQL hosted in cloudrun as part of this setup 
  PROJECT_NUMBER="$(gcloud projects describe "${PROJECT_ID}" --format='get(projectNumber)')"

  gcloud iam service-accounts create cloudrun-invoker  --project="$PROJECT_ID" --display-name="Cloudrun Invoker"

  gcloud projects add-iam-policy-binding "${PROJECT_NUMBER}" \
  --member="serviceAccount:cloudrun-invoker@$PROJECT_ID.iam.gserviceaccount.com" \
  --role=roles/run.invoker

  URL_CONTENT="<Authentication><GoogleIDToken><Audience useTargetUrl=\"true\"/></GoogleIDToken></Authentication><URL>$GRAPHQL_HOSTED_ENDPOINT</URL>"
  sed -i -e "s#<URL>.*</URL>#$URL_CONTENT#g" apiproxy/targets/default.xml
fi

TOKEN=$(gcloud auth print-access-token)

echo "Installing dependencies"

echo "Installing apigeecli"
curl -s https://raw.githubusercontent.com/apigee/apigeecli/master/downloadLatest.sh | bash
export PATH=$PATH:$HOME/.apigeecli/bin

echo "Deploying Apigee artifacts..."

echo "Importing and Deploying Apigee graphql-basic-proxy proxy..."
apigeecli apis create bundle -f apiproxy  -n graphql-basic-proxy --org "$PROJECT" --token "$TOKEN" --disable-check 
REV=$(apigeecli apis create bundle -f apiproxy  -n graphql-basic-proxy --org "$PROJECT" --token "$TOKEN" --disable-check | jq ."revision" -r)
apigeecli apis deploy --wait --name graphql-basic-proxy --ovr --rev "$REV" --org "$PROJECT" --env "$APIGEE_ENV" --token "$TOKEN"

# var is expected by integration test (apickli)
export PROXY_URL="$APIGEE_HOST/v1/samples/graphql-basic-proxy"

echo " "
echo "All the Apigee artifacts are successfully deployed!"
echo " "
echo "Your Proxy URL is: https://$PROXY_URL"

if [ -z "$GRAPHQL_HOSTED" ]; then 
  if [[ $GRAPHQL_ENDPOINT == "$STATIC_GRAPHQL_ENDPOINT" ]]; then
    echo " "
    echo "Introspect GraphQL schema via Apigee Endpoint: https://studio.apollographql.com/sandbox/explorer?endpoint=https://$PROXY_URL"
    echo " "
    echo "Test GraphQL endpoint via Apigee proxy:"
    echo curl \"https://$PROXY_URL\" --request POST --header \'content-type: application/json\' \
    --data \'{\"query\":\"query GetLaunches {\\n  launches {\\n    launches {\\n      id\\n      site\\n      rocket {\\n        id\\n        name\\n      }\\n    }\\n  }\\n}\"}\'
    echo " "
  fi
else
  curl --request POST \
    --header 'content-type: application/json' \
    --url "https://$PROXY_URL" \
    --data '{"query":"query ExampleQuery {\n  books {\n    title\n    author\n  }\n}"}'
fi
