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

export PROJECT_ID="<GCP_PROJECT_ID>"
export APIGEE_HOST="<APIGEE_DOMAIN_NAME>"
export APIGEE_ENV="<APIGEE_ENVIRONMENT_NAME>"

gcloud config set project $PROJECT_ID

#Update the below value if you want to point to any other external GraphQL endpoint.
#You can also leave this valaue blank, and deploy GraphQL service in CloudRun (Instructions provided in the README doc)
#Example GraphQL endpoint you can use "https://apollo-fullstack-tutorial.herokuapp.com/graphql"
export GRAPHQL_ENDPOINT="<GraphQL endpoint URI (with https prefixed)>"