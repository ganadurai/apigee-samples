const { RESTDataSource } = require('apollo-datasource-rest');

class AuthorAPI extends RESTDataSource {
  constructor() {
    super();
    //The string "ENV_HOSTNAME" will be replaced at the time of deploying cloudrun, 
    //using the user environment value. check deploy-graphql-basic-proxy.sh
    this.baseURL = 'https://ENV_HOSTNAME/v1/graphql-sample-api-source/';
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
      name: author.name
    };
  }
}

module.exports = AuthorAPI;