const { gql } = require('apollo-server-express');
const { Neo4jGraphQL } = require('@neo4j/graphql');

const typeDefs = gql`
  type Verse {
    id: ID!
    reference: String!
    text: String  # Fetched dynamically
    connections: [Verse] @relationship(type: "REFERENCES", direction: OUT)
  }

  type Query {
    verse(reference: String!): Verse
    subgraph(reference: String!, depth: Int = 2): [Verse]
  }
`;

const neo4jGraphQL = new Neo4jGraphQL({ typeDefs, driver });

module.exports = { typeDefs, neoSchema: neo4jGraphQL };