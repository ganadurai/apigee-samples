# Basic Quota

---
This sample shows how to implement a [Apigee proxy for GraphQL backend] (https://cloud.google.com/apigee/docs/api-platform/develop/graphql). 

Let's get started!

---

## Setup environment

Ensure you have an active GCP account selected in the Cloud shell

```sh
gcloud auth login
```

Navigate to the `graphql-basic-proxy` directory in the Cloud shell.

```sh
cd graphql-basic-proxy
```

Edit the provided sample `env.sh` file, and set the environment variables there.

Click <walkthrough-editor-open-file filePath="graphql-basic-proxy/env.sh">here</walkthrough-editor-open-file> to open the file in the editor

Then, source the `env.sh` file in the Cloud shell.

```sh
source ./env.sh
```

---

## Deploy GraphQL sample application in Cloud Run 

This is optional, if you dont have a GraphQL backend for Apigee to proxy into, execute the below to deploy GraphQL application for which Apigee will the facade.

```sh
cd graphql-basic-proxy/graphql-server
./deploy-graphql-sample-application.sh
```

## Deploy Apigee components

Next, let's create and deploy the Apigee resources necessary to test the quota policy.

```sh
cd graphql-basic-proxy
./deploy-graphql-basic-proxy.sh
```

This script creates a sample API Proxy for the graphql backend endpoint.

```sh
export PROXY_URL="$APIGEE_HOST/v1/samples/graphql-basic-proxy"

echo " "
echo "All the Apigee artifacts are successfully deployed!"
echo " "
echo "Your Proxy URL is: https://$PROXY_URL"


echo "Introspect GraphQL schema via Apigee Endpoint: "
echo "https://studio.apollographql.com/sandbox/explorer?endpoint=https://$PROXY_URL"
echo " "
```

---
## Conclusion

<walkthrough-conclusion-trophy></walkthrough-conclusion-trophy>

Congratulations! You've successfully implemented Apigee proxy for graphql endpoint.

<walkthrough-inline-feedback></walkthrough-inline-feedback>

## Cleanup

If you want to clean up the artefacts from this example in your Apigee Organization, first source your `env.sh` script, and then run

```bash
./clean-up-graphql-basic-proxy.sh
```
