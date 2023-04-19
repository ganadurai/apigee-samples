
//https://www.apollographql.com/blog/graphql/examples/building-a-graphql-api/

const { ApolloServer } = require('apollo-server');
const typeDefs = require('./schema');
const resolvers = require('./resolvers');

const BookAPI = require('./datasources/book-api');
const AuthorAPI = require('./datasources/author-api');

const server = new ApolloServer({
  typeDefs,
  resolvers,
  dataSources: () => ({
    bookAPI: new BookAPI(),
    authorAPI: new AuthorAPI()
  }),
  introspection: true
});

// The `listen` method launches a web server.
server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
  console.log(`
    Server is running!
    Listening on port 4000
    Explore at https://studio.apollographql.com/dev
  `);
});