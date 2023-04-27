const { gql } = require('apollo-server');

const typeDefs = gql`
  type Book {
    isbn_id: ID!
    publication_cost: String
    title: String
    author: Author
  }

  type Author {
    id: ID!
    name: String
  }

  type Query {
    books: [Book]!
    book(isbn_id: ID!): Book
    authors: [Author]
  }
`;

module.exports = typeDefs;
