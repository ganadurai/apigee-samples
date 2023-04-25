//var authz_query_attrs = context.getVariable("verifyapikey.Verify-API-Key-1.apiproduct.authz_query_attrs");
//var authz_query_attrs = ["isbn_id","title","author.id","author.name"]
//var authz_query_attrs = ["title","author.id","author.name"]

var authz_query_attrs = context.getVariable("cosumer.scope.allowed.attrs");
var accessedFields = context.getVariable("accessedFields");

var notAllowedFields = [];

print(JSON.stringify(authz_query_attrs));

for (var i = 0; i < accessedFields.length; i++) {
    if (authz_query_attrs.indexOf(accessedFields[i]) == -1) {
        notAllowedFields.push(accessedFields[i]);
        context.setVariable("isAttrQueryNotAllowed", "true");
    }
}