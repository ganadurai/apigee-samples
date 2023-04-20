books = JSON.parse(context.getVariable("response.content"))

selectedBook = {};
print("id = " + context.getVariable("request.queryparam.id"));
for (i = 0; i < books.length; i++) {
    if (books[i]["isbn_id"] == context.getVariable("request.queryparam.id")) {
      selectedBook = books[i];
      print(selectedBook);
    }
}

context.setVariable("response.content", JSON.stringify(selectedBook));
