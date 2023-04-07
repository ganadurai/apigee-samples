# Apigee API Proxy for GraphQL endpoints.
This sample lets you to create an API proxy for a public GraphQL API. An API proxy will enable including security, threat protection, caching, and other advanced mediation needs before the request is forwarded to the upstream GraphQL endpoints.

## About GraphQL
GraphQL is a query language for your API, and a server-side runtime for executing queries using a type system you define for your data. GraphQL isn't tied to any specific database or storage engine and is instead backed by your existing code and data.

## How it works
Apigee API proxy provides a facade for the backend GraphQL service. The API proxy decouples  backend service implementation from the API endpoint that developers consume. The GraphQL endpoint will be defined as TargetEnpoint within Apigee proxy definition. A client submits the GraphQL query body to an Apigee endpoint, the payload of the GraphQL request is processed and manipulated (if needed) and forwarded to the GraphQL backend endpoint. The response from  upstream GraphQL server is recievied by Apigee, processed (if needed) and sent to the client.

## GraphQL Endpoint 

``` bash
export GRAPHQL_ENDPOINT="https://apollo-fullstack-tutorial.herokuapp.com/graphql"
```
If for any reason, you need to change the GraphQL endpoint Apigee uses, change the above variable to the url you need.

### Setup environment

1. Clone the `apigee-samples` repo, and switch the `graphql-basic-proxy` directory

```bash
git clone https://github.com/GoogleCloudPlatform/apigee-samples.git
cd apigee-samples/graphql-basic-proxy
export WORK_DIR=$(pwd)
```

2. Edit `env.sh` and configure the following variables:

* `PROJECT` the project where your Apigee organization is located
* `APIGEE_HOST` the externally reachable hostname of the Apigee environment group that contains APIGEE_ENV
* `APIGEE_ENV` the Apigee environment where the demo resources should be created
* `GRAPHQL_ENDPOINT` the GraphQL endpoint Apigee will be proxing. You can skip this variable if you dont have an GraphQL endpoint. In the below steps you can host a GraphQL sample application in Cloud Run. Example: https://apollo-fullstack-tutorial.herokuapp.com/graphql

Now source the `env.sh` file

```bash
source ./env.sh
```

## Sample GraphQL server
If for any reason you need a GraphQL endpoint, follow the below steps to host GraphQL sample application in Cloud Run.

``` bash
gcloud services enable cloudbuild.googleapis.com artifactregistry.googleapis.com run.googleapis.com

cd ${WORK_DIR}/graphql-server/source

export GRAPHQL_HOSTED=true

gcloud run deploy graphql-example-application   \
  --region us-central1   \
  --port 4000 \
  --source .

export GRAPHQL_HOSTED_ENDPOINT='<Service URL value from the above output>'
```
example: export GRAPHQL_HOSTED_ENDPOINT='https://graphql-example-application-snooggghha-uc.a.run.app'

## Implementation on Apigee 

### Prerequisites
1. [Provision Apigee X](https://cloud.google.com/apigee/docs/api-platform/get-started/provisioning-intro)
2. Configure [external access](https://cloud.google.com/apigee/docs/api-platform/get-started/configure-routing#external-access) for API traffic to your Apigee X instance
3. Access to deploy proxies
4. Make sure the following tools are available in your terminal's $PATH (Cloud Shell has these preconfigured)
    * [gcloud SDK](https://cloud.google.com/sdk/docs/install)
    * unzip
    * curl
    * jq
    * npm
    
### (QuickStart) Setup using CloudShell

Use the following GCP CloudShell tutorial, and follow the instructions.

[![Open in Cloud Shell](https://gstatic.com/cloudssh/images/open-btn.png)](https://ssh.cloud.google.com/cloudshell/open?cloudshell_git_repo=https://github.com/GoogleCloudPlatform/apigee-samples&cloudshell_git_branch=main&cloudshell_workspace=.&cloudshell_tutorial=graphql-basic-proxy/docs/cloudshell-tutorial.md)

### Deploy Apigee Proxy

```bash
./deploy-graphql-basic-proxy.sh
```

### Testing the Proxy

```
curl --request POST \
  --header 'content-type: application/json' \
  --url "https://$PROXY_URL" \
  --data '{"query":"query { __typename }"}'
```

### Cleanup

If you want to clean up the artefacts from this example in your Apigee Organization, first source your `env.sh` script, and then run

```bash
./clean-up-graphql-basic-proxy.sh
```