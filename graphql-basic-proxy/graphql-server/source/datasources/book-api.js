const { RESTDataSource } = require('apollo-datasource-rest');

const AuthorAPI = require('./author-api');

const book1 = {
  isbn_id: '001AABB',
  title: 'The Great Gatsby',
  author_id: '1001'
}

const book2 = {
  isbn_id: '099XXYY',
  title: 'Wuthering Heights',
  author_id: '1001'
}

const book3 = {
  isbn_id: '077FFOO',
  title: 'Space and Beyond',
  author_id: '3001'
}

const books = [
  book1,
  book2,
  book3
]

const book_map = {
  '001AABB': book1,
  '099XXYY': book2,
  '077FFOO': book3
}

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
      title: book.title,
      author_id: book.author_id
    };
  }
}

module.exports = BookAPI;
