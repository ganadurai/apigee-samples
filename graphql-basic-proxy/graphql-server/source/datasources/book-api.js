const { RESTDataSource } = require('apollo-datasource-rest');

class BookAPI extends RESTDataSource {
  constructor() {
    super();
    //The string "ENV_HOSTNAME" will be replaced at the time of deploying cloudrun, 
    //using the user environment value. check deploy-graphql-basic-proxy.sh
     this.baseURL = 'https://ENV_HOSTNAME/v1/graphql-sample-api-source/';
  }

  async getAllBooks() {
    const books = await this.get('books');
    return Array.isArray(books)
      ? books.map(book => this.bookReducer(book))
      : [];
  }

  async getBookByIsbnId({ isbnId }) {
    const response = await this.get('books', { id: isbnId });
    return this.bookReducer(response);
  }

  bookReducer(book) {
    return {
      isbn_id: book.isbn_id,
      publication_cost: book.publication_cost,
      title: book.title,
      author_id: book.author_id
    };
  }
}

module.exports = BookAPI;
