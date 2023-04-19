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

if [ -z "$WORK_DIR" ]; then
    echo "No WORK_DIR variable set"
    exit
fi

gcloud config set project "$PROJECT_ID"

gcloud services enable cloudbuild.googleapis.com artifactregistry.googleapis.com run.googleapis.com

cd ${WORK_DIR}/graphql-server/source

export GRAPHQL_HOSTED=true

gcloud run deploy graphql-example-application   \
  --region us-central1   \
  --port 4000 \
  --source .

export GRAPHQL_HOSTED_ENDPOINT=$(gcloud run services describe graphql-example-application --region us-central1 --format json | jq .status.url|cut -d '"' -f 2)


