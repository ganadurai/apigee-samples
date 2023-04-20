authors = JSON.parse(context.getVariable("response.content"))

selectedAuthor = {};
print("id = " + context.getVariable("request.queryparam.id"));
for (i = 0; i < authors.length; i++) {
    if (authors[i]["id"] == context.getVariable("request.queryparam.id")) {
      selectedAuthor = authors[i];
      print(selectedAuthor);
    }
}

context.setVariable("response.content", JSON.stringify(selectedAuthor));
