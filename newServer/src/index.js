import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { ApolloServer } from '@apollo/server';
import fastifyApollo, { fastifyApolloDrainPlugin } from '@as-integrations/fastify';
import { typeDefs } from './graphql/schema.js';
import { resolvers } from './graphql/resolvers.js';
import { prisma } from './lib/prisma.js';

const fastify = Fastify({
  logger: true,
});

const PORT = process.env.PORT || 4000;

// Start server
async function start() {
  try {
    // CORS
    await fastify.register(cors, {
      origin: ['http://localhost:3000', 'http://localhost:3001'],
      credentials: true,
    });

    // Apollo Server
    const apolloServer = new ApolloServer({
      typeDefs,
      resolvers,
      plugins: [fastifyApolloDrainPlugin(fastify)],
    });

    await apolloServer.start();

    // Register Apollo Server with context
    await fastify.register(fastifyApollo(apolloServer), {
      context: async (request, reply) => {
        return {
          request,
          reply,
        };
      },
    });

    // Health check endpoint
    fastify.get('/health', async (request, reply) => {
      try {
        await prisma.$queryRaw`SELECT 1`;
        const jobsCount = await prisma.job.count();
        
        return {
          status: 'OK',
          database: 'Connected',
          jobsCount,
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        reply.code(500);
        return {
          status: 'ERROR',
          database: 'Disconnected',
          error: error.message,
        };
      }
    });

    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`🚀 Server ready at http://localhost:${PORT}`);
    console.log(`🎯 GraphQL endpoint: http://localhost:${PORT}/graphql`);
    console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  await fastify.close();
  await prisma.$disconnect();
});

start();

