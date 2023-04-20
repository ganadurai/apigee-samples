module.exports = {
  Query: {
    books: async (_, __, { dataSources }) => {
      books = await dataSources.bookAPI.getAllBooks();
      books.map(book => {
        book.author=dataSources.authorAPI.getAuthorById(book.author_id);
      });
      return books;
    },
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
