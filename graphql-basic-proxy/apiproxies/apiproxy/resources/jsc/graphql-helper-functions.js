 
var fieldCounts = {};
var objectsCount = {};
function countFields(path, value, requestedFields) {

  if (!fieldCounts[path] && requestedFields[path]) {
      fieldCounts[path] = {count: 0, empty: 0}
  }
      
  if (requestedFields[path]) fieldCounts[path].count++;

  
  if (value == null) {
     //null value
     if(requestedFields[path]) fieldCounts[path].empty++;  
     return;
  } 

  if (typeof value  === 'string') {
    //string value
    if (value.length === 0 && requestedFields[path]) {
      fieldCounts[path].empty++;
    }
    return;
  } 
  
  if(value.length >= 0) {
    //array value
    if (value.length === 0 && requestedFields[path]) {
        fieldCounts[path].empty++;
        return;
    }

    if (requestedFields[path]) return;
    for (var i = 0; i < value.length; i++) {
      countFields(path, value[i], requestedFields)
    }
    return;
  } 

  if (typeof value === 'number') {
     //numeric value
    return;
  }
  
  if (typeof value === 'boolean') {
     //boolean value
     return;
  }


  //must be an object
  var subKeys = Object.keys(value);
  if (subKeys.length == 0 && requestedFields[path]) {
    fieldCounts[path].empty++;
    return;
  }
    
  if (requestedFields[path]) return;

  for (var i = 0; i < subKeys.length; i++) {
    var subKey = subKeys[i];
    countFields(path + "." + subKey, value[subKey], requestedFields)
  }
}

function countObjects(path, value, requestedFields) {
  if (!objectsCount[path] && requestedFields[path]) {
      objectsCount[path] = {count: 0, empty: 0}
  }
      
  /*if (requestedFields[path]){
     objectsCount[path].count++;
  }*/

  
  if (value == null) {
     //null value
     if(requestedFields[path]) objectsCount[path].count++;  
     return;
  } 

  if (typeof value  === 'string') {
    //string value
    if (requestedFields[path]) {
      objectsCount[path].count++;
    }
    return;
  } 
  
  if(value.length >= 0) {
    //array value
    if (requestedFields[path]) {
        objectsCount[path].count += value.length;
        return;
    }

    for (var i = 0; i < value.length; i++) {
      countObjects(path, value[i], requestedFields)
    }
    return;
  } 

  if (typeof value === 'number') {
     //numeric value
    if (requestedFields[path]) {
      objectsCount[path].count += value.length;
    }
    return;
  }
  
  if (typeof value === 'boolean') {
     //boolean value
    if (requestedFields[path]) {
      objectsCount[path].count += value.length;
    }
     return;
  }


  //must be an object
  var subKeys = Object.keys(value);
  if (requestedFields[path]) {
    objectsCount[path].count++;
    return;
  }

  for (var i = 0; i < subKeys.length; i++) {
    var subKey = subKeys[i];
    countObjects(path + "." + subKey, value[subKey], requestedFields)
  }
}

function getFieldLevelMetrics(accessedFields, responseJson) {
  if (!responseJson || !responseJson.data || responseJson.data.length === 0) {
      return {};
  }
  
  var requestedFields = {};
  fieldCounts = {};
  for (var i = 0; i < accessedFields.length;i++){
    requestedFields[accessedFields[i]] = true
  }
  countFields("query", responseJson.data, requestedFields);
  return fieldCounts;

}

function getObjectLevelMetrics(accessedObjects, responseJson) {
  if (!responseJson || !responseJson.data || responseJson.data.length === 0) {
      return {};
  }
  
  var requestedObjects = {};
  objectsCount = {};
  for (var i = 0; i < accessedObjects.length;i++){
    requestedObjects[accessedObjects[i]] = true
  }
  countObjects("query", responseJson.data, requestedObjects);
  return objectsCount;

}

var selectionSetFields = [];
function processSelectionSet(prefix, path) {
    var name = context.getVariable(prefix+".name")
    var count = parseInt(context.getVariable(prefix+".selectionSet.count"));
    
    if (count === 0) {
        selectionSetFields.push((path + "." + name).replace(/query\.[^.]+\./,"query."));
        return;
    }
    
    for (var i = 1; i <= count; i++) {
         processSelectionSet(prefix +".selectionSet." + i , path + "." + name)
    }
}

function getAccessedGraphQLFields() {
    selectionSetFields = [];
    processSelectionSet("graphql.operation", "query");
    return selectionSetFields;
}

function ObjValues(obj) {
  var keys = Object.keys(obj);
  var values = [];
  for (var i = 0; i < keys.length; i++) {
    values.push(obj[keys[i]]);
  }
  return values;
}

function getQueriedQuotaGraphQLObjects(accessedFields, objectQuotas, maxCount) {
    if (!objectQuotas) {
      return [];
    }


    var subset = {};
    for (var i = 0; i < accessedFields.length; i++) {
      var fieldName = accessedFields[i];

      //first check if exact match
      if (objectQuotas[fieldName]) {
        subset[fieldName] = objectQuotas[fieldName];
        subset[fieldName].path = fieldName;
        continue;
      }

      var parts = fieldName.split(".");
      for (var j = parts.length; j > 0 ; j--) {
        var newFieldName = "";
        for (var k = 0; k < j; k++) {
          if (newFieldName === "") {
            newFieldName = parts[k];
          }
          else {
            newFieldName = newFieldName + "." + parts[k];
          }
        }

        if (objectQuotas[newFieldName]) {
          subset[newFieldName] = objectQuotas[newFieldName];
          subset[newFieldName].path = newFieldName;
        }
      }
    }

    var values = ObjValues(subset);
    values.sort(function(object1, object2) {
      return object1.priority - object2.priority;
    });

    return values.slice(0,maxCount);
}

function setupGraphQLQuotaReqFlowVars(accessedFields, objectQuotas, maxQuotas) {
  var requestLimitObjects = getQueriedQuotaGraphQLObjects(accessedFields, objectQuotas, maxQuotas);
  var flowVariables = [];

  var objects = [];
  for (var i = 0; i < requestLimitObjects.length; i++) {
    var policyNumber = i + 1;
    flowVariables.push({key: "quota_gql_obj_" + policyNumber + "_enabled", value: true})
    flowVariables.push({key: "quota_gql_obj_" + policyNumber + "_path", value: requestLimitObjects[i]["path"]});
    flowVariables.push({key: "quota_gql_obj_" + policyNumber + "_timeUnit", value: requestLimitObjects[i]["timeUnit"]});
    flowVariables.push({key: "quota_gql_obj_" + policyNumber + "_interval", value: requestLimitObjects[i]["interval"]});
    flowVariables.push({key: "quota_gql_obj_" + policyNumber + "_allow", value: requestLimitObjects[i]["allow"]});
    flowVariables.push({key: "quota_gql_obj_" + policyNumber + "_messageWeight", value: 0});
    objects.push(requestLimitObjects[i]["path"]);
  }

  context.setVariable("quota_gql_obj_list", objects.join(","));
  for (var i = 0; i < flowVariables.length; i++) {
    context.setVariable(flowVariables[i].key, flowVariables[i].value);
  }

  for (var i = requestLimitObjects.length ; i < maxQuotas; i++) {
    var policyNumber = i + 1;
    context.setVariable("quota_gql_obj_" + policyNumber + "_enabled", false);
    context.setVariable("quota_gql_obj_" + policyNumber + "_path", null);
    context.setVariable("quota_gql_obj_" + policyNumber + "_timeUnit", null);
    context.setVariable("quota_gql_obj_" + policyNumber + "_interval", null);
    context.setVariable("quota_gql_obj_" + policyNumber + "_allow", null);
    context.setVariable("quota_gql_obj_" + policyNumber + "_messageWeight", null);
  } 
}

function setupGraphQLQuotaResFlowVars() {
  var objectListStr = context.getVariable("quota_gql_obj_list");
  var responseJson = parseGraphQLResponse
  if (!objectListStr) return;

  var objectsList = objectListStr.split(",");
  var objectsCount =  getObjectLevelMetrics(objectsList, parseGraphQLResponse(context.getVariable("response.content")));
  for (var  i = 0; i < objectsList.length; i++) {
    var objectPath = objectsList[i];
    var policyNumber = i + 1;
    var count = objectsCount[objectPath]? objectsCount[objectPath].count: 0;
    context.setVariable("quota_gql_obj_" + policyNumber + "_messageWeight", "" + objectsCount[objectPath].count);
  }
}

function parseGraphQLQuotaDefinition(defStr) {
  try {
   return JSON.parse(defStr);
  }
  catch(ex) {
    throw new Error("Could not parse Quota definition. Error: " + ex.message);
  }
}


function parseGraphQLRequest(reqStr) {
    try {
        return JSON.parse(reqStr)
    } catch (ex) {
        throw new Error("Could not process GraphQL Request as JSON. Error: " + ex.message)    
    }
}

function parseGraphQLResponse(resStr) {
    try {
        return JSON.parse(resStr)
    } catch (ex) {
        throw new Error("Could not process GraphQL Response as JSON. Error: " + ex.message)    
    }
}

