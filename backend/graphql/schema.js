const { gql } = require('apollo-server-express');
const { neo4jgraphql } = require('neo4j-graphql-js');

const typeDefs = gql`
  type Verse {
    id: ID!
    reference: String!
    text: String  # Fetched dynamically
    connections: [Verse] @relation(name: "REFERENCES", direction: OUT)
  }

  type Query {
    verse(reference: String!): Verse
    subgraph(reference: String!, depth: Int = 2): [Verse]
  }
`;

const resolvers = {
  Verse: {
    text: async (parent, _, { esvService }) => esvService.getVerseText(parent.reference),
  },
  Query: {
    verse: neo4jgraphql,  // Auto-generates from schema
    subgraph: async (_, { reference, depth }, { driver }) => {
      const session = driver.session();
      try {
        const result = await session.run(
          `MATCH (v:Verse {reference: $reference})-[r:REFERENCES*1..$depth]-(connected:Verse)
           RETURN DISTINCT connected LIMIT 5000`,
          { reference, depth }
        );
        if (result.records.length === 5000) console.warn('Pruned to max');
        return result.records.map(rec => rec.get('connected').properties);
      } finally {
        session.close();
      }
    },
  },
};

module.exports = { typeDefs, resolvers };