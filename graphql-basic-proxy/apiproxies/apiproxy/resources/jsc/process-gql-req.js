
var requestJSON = parseGraphQLRequest(context.getVariable("request.content"))
//print("requestJSON:")
//print(requestJSON);

context.setVariable("graphql_query", requestJSON.query);

var accessedFields = getAccessedGraphQLFields();
context.setVariable("sortedFieldsList", JSON.stringify(accessedFields.sort()))

//print("accessedFields:")
//print(JSON.stringify(accessedFields, null, 2));

//THe request body should be in this format
//{"query": "query xxxxx {xxxxx {id_ description_

for (var i = 0; i < accessedFields.length; i++) {
    accessedFields[i] = accessedFields[i].replace(/query\.[^.]+\./, '');
}

//print("post-processing accessedFields:")
//print(JSON.stringify(accessedFields, null, 2));

context.setVariable("accessedFields", accessedFields);

//For Testing, setting the variable. This should come from Product scope
//context.setVariable("customerscope", "books.reader");
//print('graphqlscope : ' + context.getVariable("verifyapikey.Verify-API-Key-1.apiproduct.graphqlscope"));

context.setVariable("customerscope", context.getVariable("verifyapikey.Verify-API-Key-1.apiproduct.scope"));
context.setVariable("customerscopeschema", context.getVariable("customerscope") + ".schema");

function break_address(url_add) {
    var data = url_add.split("://")
    var protocol = data[0];
    data = data[1].split(".com");
    var domain = data[0];
    data = data[1].split("/");

    if(data[1]){
        return [protocol,domain,data[1]]
    }

    return [protocol,domain]
}

var url_add = "https://www.w3resource.com/javascript-exercises/"
print("Original address: "+url_add)
print(break_address(url_add))