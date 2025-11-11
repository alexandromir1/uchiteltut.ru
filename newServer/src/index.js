import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
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
    const allowedOrigins = process.env.CORS_ORIGINS 
      ? process.env.CORS_ORIGINS.split(',')
      : ['http://localhost:3000', 'http://localhost:3001', 'http://client:80'];
    
    await fastify.register(cors, {
      origin: allowedOrigins,
      credentials: true,
    });

    // Multipart for file uploads
    await fastify.register(multipart, {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
        files: 1,
      },
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

    // REST: Send job application with optional resume
    fastify.post('/api/respond', async (request, reply) => {
      try {
        const parts = request.parts();
        const form = {};
        let resumeFile = null;

        for await (const part of parts) {
          if (part.type === 'file') {
            resumeFile = await part.toBuffer();
            form.resumeFilename = part.filename;
            form.resumeMimetype = part.mimetype || 'application/octet-stream';
          } else {
            form[part.fieldname] = part.value;
          }
        }

        const { toEmail, fio, phone, education, experience, jobId, jobTitle, school, region } = form;
        if (!toEmail) {
          reply.code(400);
          return { error: 'Missing target email' };
        }

        // Nodemailer transport
        const nodemailer = (await import('nodemailer')).default;
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT || 587),
          secure: !!(process.env.SMTP_SECURE === 'true'),
          auth: process.env.SMTP_USER && process.env.SMTP_PASS ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          } : undefined,
        });

        const subject = `Отклик на вакансию: ${jobTitle || 'Без названия'} ${school ? '— ' + school : ''}`;
        const textBody = [
          `Вакансия: ${jobTitle || 'Без названия'}`,
          school ? `Школа: ${school}` : null,
          region ? `Регион: ${region}` : null,
          jobId ? `ID вакансии: ${jobId}` : null,
          '',
          `ФИО: ${fio || '-'}`,
          `Телефон: ${phone || '-'}`,
          `Образование: ${education || '-'}`,
          `Опыт работы: ${experience || '-'}`,
        ].filter(Boolean).join('\n');

        const attachments = [];
        if (resumeFile) {
          attachments.push({
            filename: form.resumeFilename || 'resume.pdf',
            content: resumeFile,
            contentType: form.resumeMimetype,
          });
        }

        const recipients = [toEmail, '79644228177@mail.ru']
          .filter(Boolean)
          .join(',');

        await transporter.sendMail({
          from: process.env.MAIL_FROM || process.env.SMTP_USER || 'no-reply@uchiteltut.ru',
          to: recipients,
          subject,
          text: textBody,
          attachments,
        });

        return { ok: true };
      } catch (err) {
        request.log.error(err);
        reply.code(500);
        return { error: 'Failed to send response', details: err.message };
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

