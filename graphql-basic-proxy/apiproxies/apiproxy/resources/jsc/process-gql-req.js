
var requestJSON = parseGraphQLRequest(context.getVariable("request.content"))
context.setVariable("graphql_query", requestJSON.query);

var accessedFields = getAccessedGraphQLFields();
context.setVariable("sortedFieldsList", JSON.stringify(accessedFields.sort()))

print("accessedFields:")
print(JSON.stringify(accessedFields, null, 2));

//THe request body should be in this format
//{"query": "query xxxxx {xxxxx {id_ description_

for (var i = 0; i < accessedFields.length; i++) {
    accessedFields[i] = accessedFields[i].replace(/query\.[^.]+\./, '');
}

print("post-processing accessedFields:")
print(JSON.stringify(accessedFields, null, 2));

context.setVariable("accessedFields", accessedFields);