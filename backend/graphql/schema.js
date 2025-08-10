const { gql } = require('apollo-server-express');
const { Neo4jGraphQL } = require('@neo4j/graphql');

const typeDefs = gql`
  type Verse {
    id: ID!
    reference: String!
    text: String  # Fetched dynamically
    connections: [Verse!]! @relationship(type: "REFERENCES", direction: OUT)
  }

  type Query {
    verse(reference: String!): Verse
    subgraph(reference: String!, depth: Int = 2): [Verse!]!
  }
`;

module.exports = (driver) => new Neo4jGraphQL({ typeDefs, driver, resolvers: {
  Query: {
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
      } catch (error) {
        console.error('Subgraph error:', error);
        return [];  // Return empty array on error to satisfy non-nullable type
      } finally {
        await session.close();
      }
    },
  },
} });