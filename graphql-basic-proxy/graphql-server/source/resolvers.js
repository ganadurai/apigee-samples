module.exports = {
  Query: {
    books: (_, __, { dataSources }) =>
      dataSources.bookAPI.getAllBooks(),
    book: async (_, { isbn_id }, { dataSources }) => {
      book = await dataSources.bookAPI.getBookByIsbnId({ isbnId: isbn_id })
      if (book != null) {
        book.author=dataSources.authorAPI.getAuthorById(book.author_id);
        return book;
      } else {
        return;
      }
    },
    authors: (_, __, { dataSources }) =>
      dataSources.authorAPI.getAllAuthors()
  }
};
