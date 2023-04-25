# GraphQL - Apigee Proxy

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
export WORK_DIR=$(pwd)
```

Edit the provided sample `env.sh` file, and set the environment variables there.

Click <walkthrough-editor-open-file filePath="env.sh">here</walkthrough-editor-open-file> to open the file in the editor

Then, source the `env.sh` file in the Cloud shell.

```sh
source ./env.sh
```

---

## Deploy Apigee components

Next, let's create and deploy the Apigee resources necessary to test the quota policy.

```sh
./deploy-graphql-basic-proxy.sh
```

## Cleanup

If you want to clean up the artefacts from this example in your Apigee Organization, first source your `env.sh` script, and then run

```bash
./clean-up-graphql-basic-proxy.sh
```
---
## Conclusion

<walkthrough-conclusion-trophy></walkthrough-conclusion-trophy>

Congratulations! You've successfully implemented Apigee proxy for graphql endpoint.

<walkthrough-inline-feedback></walkthrough-inline-feedback>
