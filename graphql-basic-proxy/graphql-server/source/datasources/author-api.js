const { RESTDataSource } = require('apollo-datasource-rest');

class AuthorAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = 'https://34.160.38.226.nip.io/v1/graphql-sample-api-source/';
  }

  async getAllAuthors() {
    const authors = await this.get('authors');
    return Array.isArray(authors)
      ? authors.map(author => this.authorReducer(author))
      : [];
  }

  async getAuthorById(authorId) {
    const response = await this.get('authors', { id: authorId });
    return this.authorReducer(response);
  }

  authorReducer(author) {
    return {
      id: author.id,
      name: author.name,
      books: author.books
    };
  }
}

module.exports = AuthorAPI;