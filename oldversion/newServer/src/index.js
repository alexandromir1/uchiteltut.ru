import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import { ApolloServer } from '@apollo/server';
import fastifyApollo, { fastifyApolloDrainPlugin } from '@as-integrations/fastify';
import { typeDefs } from './graphql/schema.js';
import { resolvers } from './graphql/resolvers.js';
import { prisma } from './lib/prisma.js';

// Функция для экранирования HTML (защита от XSS)
function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Функция отправки email через HTTP API (Brevo/Sendinblue)
async function sendEmailViaHttpApi(request, reply, { toEmail, fio, phone, education, experience, jobId, jobTitle, school, region, resumeFile, form }) {
  try {
    const apiUrl = process.env.EMAIL_API_URL || 'https://api.brevo.com/v3/smtp/email';
    const apiKey = process.env.EMAIL_API_KEY;
    
    // Получатели
    const recipients = [];
    if (toEmail && toEmail.trim()) {
      recipients.push({ email: toEmail.trim() });
    }
    recipients.push({ email: '79644228177@mail.ru' });
    
    // Убираем дубликаты
    const uniqueRecipients = [...new Map(recipients.map(r => [r.email, r])).values()];
    
    const subject = `Отклик на вакансию: ${jobTitle || 'Без названия'}${school ? ' — ' + school : ''}`;
    
    // HTML версия письма
    const htmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4CAF50; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
          .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
          .section { margin-bottom: 20px; }
          .label { font-weight: bold; color: #555; }
          .value { margin-left: 10px; }
          .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #777; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2 style="margin: 0;">Новый отклик на вакансию</h2>
          </div>
          <div class="content">
            <div class="section">
              <h3>Информация о вакансии</h3>
              <p><span class="label">Вакансия:</span> <span class="value">${escapeHtml(jobTitle || 'Без названия')}</span></p>
              ${school ? `<p><span class="label">Школа:</span> <span class="value">${escapeHtml(school)}</span></p>` : ''}
              ${region ? `<p><span class="label">Регион:</span> <span class="value">${escapeHtml(region)}</span></p>` : ''}
              ${jobId ? `<p><span class="label">ID вакансии:</span> <span class="value">${escapeHtml(String(jobId))}</span></p>` : ''}
            </div>
            <div class="section">
              <h3>Данные кандидата</h3>
              <p><span class="label">ФИО:</span> <span class="value">${escapeHtml(fio || 'Не указано')}</span></p>
              <p><span class="label">Телефон:</span> <span class="value">${escapeHtml(phone || 'Не указан')}</span></p>
              ${education ? `<p><span class="label">Образование:</span> <span class="value">${escapeHtml(education).replace(/\n/g, '<br>')}</span></p>` : ''}
              ${experience ? `<p><span class="label">Опыт работы:</span> <span class="value">${escapeHtml(experience).replace(/\n/g, '<br>')}</span></p>` : ''}
              ${resumeFile ? `<p><span class="label">Резюме:</span> <span class="value">Прикреплено (${escapeHtml(form.resumeFilename || 'resume.pdf')})</span></p>` : ''}
            </div>
          </div>
          <div class="footer">
            <p>Это письмо отправлено автоматически с портала <a href="https://uchiteltut.ru">УчительТут</a></p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    // Текстовая версия
    const textBody = [
      `Новый отклик на вакансию`,
      '',
      `Вакансия: ${jobTitle || 'Без названия'}`,
      school ? `Школа: ${school}` : null,
      region ? `Регион: ${region}` : null,
      jobId ? `ID вакансии: ${jobId}` : null,
      '',
      'Данные кандидата:',
      `ФИО: ${fio || 'Не указано'}`,
      `Телефон: ${phone || 'Не указан'}`,
      education ? `Образование: ${education}` : null,
      experience ? `Опыт работы: ${experience}` : null,
      resumeFile ? `Резюме прикреплено: ${form.resumeFilename || 'resume.pdf'}` : null,
      '',
      '---',
      'Это письмо отправлено автоматически с портала УчительТут (uchiteltut.ru)',
    ].filter(Boolean).join('\n');
    
    // Подготовка данных для Brevo API
    const emailData = {
      sender: {
        name: (process.env.MAIL_FROM || 'УчительТут').replace(/^"|"$/g, '').split('<')[0].trim() || 'УчительТут',
        email: process.env.EMAIL_FROM || process.env.SMTP_USER || 'noreply@uchiteltut.ru'
      },
      to: uniqueRecipients,
      subject: subject,
      htmlContent: htmlBody,
      textContent: textBody,
    };
    
    // Добавляем вложение, если есть
    if (resumeFile) {
      emailData.attachment = [{
        name: form.resumeFilename || 'resume.pdf',
        content: resumeFile.toString('base64'),
      }];
    }
    
    // Отправка через HTTP API
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify(emailData),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP API error: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    request.log.info('Email sent via HTTP API:', { 
      messageId: result.messageId,
      recipients: uniqueRecipients.map(r => r.email).join(', ')
    });
    
    return { 
      ok: true, 
      message: 'Отклик успешно отправлен',
      messageId: result.messageId 
    };
  } catch (err) {
    request.log.error('Error sending email via HTTP API:', err);
    throw err;
  }
}

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
        
        // Проверка наличия настроек отправки
        const useHttpApi = process.env.EMAIL_API_KEY && 
                           process.env.EMAIL_API_KEY !== 'ваш_api_ключ_из_brevo' &&
                           process.env.EMAIL_API_URL;
        const useSmtp = process.env.SMTP_USER && process.env.SMTP_PASS;
        
        request.log.info('Email config check:', { 
          hasApiKey: !!process.env.EMAIL_API_KEY,
          apiKeyLength: process.env.EMAIL_API_KEY?.length || 0,
          hasApiUrl: !!process.env.EMAIL_API_URL,
          hasSmtp: useSmtp,
          willUseHttpApi: useHttpApi
        });
        
        if (!useHttpApi && !useSmtp) {
          request.log.warn('Email credentials not configured');
          reply.code(500);
          return { error: 'Email не настроен. Настройте либо SMTP (SMTP_USER, SMTP_PASS), либо HTTP API (EMAIL_API_KEY, EMAIL_API_URL)' };
        }

        // Если используется HTTP API (Brevo/Sendinblue, Mailgun и т.д.)
        if (useHttpApi) {
          request.log.info('Using HTTP API for email sending');
          return await sendEmailViaHttpApi(request, reply, {
            toEmail, fio, phone, education, experience, jobId, jobTitle, school, region, resumeFile, form
          });
        }
        
        request.log.info('Using SMTP for email sending');

        // Nodemailer transport - поддерживает Яндекс 360, Mailgun и другие SMTP сервисы
        const nodemailer = (await import('nodemailer')).default;
        
        // Настройки SMTP для Яндекс 360 / Mail.ru
        const smtpPort = Number(process.env.SMTP_PORT || 465);
        const smtpSecure = process.env.SMTP_SECURE === 'true' || smtpPort === 465;
        
        const smtpConfig = {
          host: process.env.SMTP_HOST || 'smtp.yandex.ru',
          port: smtpPort,
          secure: smtpSecure,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
          // Увеличиваем таймауты для надежности
          connectionTimeout: 60000, // 60 секунд
          greetingTimeout: 30000,   // 30 секунд
          socketTimeout: 60000,     // 60 секунд
          // Для порта 587 используем STARTTLS
          requireTLS: smtpPort === 587,
          tls: {
            rejectUnauthorized: false, // Для тестирования, можно включить проверку сертификата
          },
        };
        
        const transporter = nodemailer.createTransport(smtpConfig);

        // Пропускаем проверку подключения (verify может блокировать из-за файрвола)
        // Вместо этого попробуем отправить письмо напрямую
        // Если не получится, ошибка будет в sendMail

        const subject = `Отклик на вакансию: ${jobTitle || 'Без названия'}${school ? ' — ' + school : ''}`;
        
        // Текстовая версия письма
        const textBody = [
          `Новый отклик на вакансию`,
          '',
          `Вакансия: ${jobTitle || 'Без названия'}`,
          school ? `Школа: ${school}` : null,
          region ? `Регион: ${region}` : null,
          jobId ? `ID вакансии: ${jobId}` : null,
          '',
          'Данные кандидата:',
          `ФИО: ${fio || 'Не указано'}`,
          `Телефон: ${phone || 'Не указан'}`,
          education ? `Образование: ${education}` : null,
          experience ? `Опыт работы: ${experience}` : null,
          resumeFile ? `Резюме прикреплено: ${form.resumeFilename || 'resume.pdf'}` : null,
          '',
          '---',
          'Это письмо отправлено автоматически с портала УчительТут (uchiteltut.ru)',
        ].filter(Boolean).join('\n');

        // HTML версия письма (с экранированием для безопасности)
        const htmlBody = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #4CAF50; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
              .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
              .section { margin-bottom: 20px; }
              .label { font-weight: bold; color: #555; }
              .value { margin-left: 10px; }
              .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #777; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2 style="margin: 0;">Новый отклик на вакансию</h2>
              </div>
              <div class="content">
                <div class="section">
                  <h3>Информация о вакансии</h3>
                  <p><span class="label">Вакансия:</span> <span class="value">${escapeHtml(jobTitle || 'Без названия')}</span></p>
                  ${school ? `<p><span class="label">Школа:</span> <span class="value">${escapeHtml(school)}</span></p>` : ''}
                  ${region ? `<p><span class="label">Регион:</span> <span class="value">${escapeHtml(region)}</span></p>` : ''}
                  ${jobId ? `<p><span class="label">ID вакансии:</span> <span class="value">${escapeHtml(String(jobId))}</span></p>` : ''}
                </div>
                <div class="section">
                  <h3>Данные кандидата</h3>
                  <p><span class="label">ФИО:</span> <span class="value">${escapeHtml(fio || 'Не указано')}</span></p>
                  <p><span class="label">Телефон:</span> <span class="value">${escapeHtml(phone || 'Не указан')}</span></p>
                  ${education ? `<p><span class="label">Образование:</span> <span class="value">${escapeHtml(education).replace(/\n/g, '<br>')}</span></p>` : ''}
                  ${experience ? `<p><span class="label">Опыт работы:</span> <span class="value">${escapeHtml(experience).replace(/\n/g, '<br>')}</span></p>` : ''}
                  ${resumeFile ? `<p><span class="label">Резюме:</span> <span class="value">Прикреплено (${escapeHtml(form.resumeFilename || 'resume.pdf')})</span></p>` : ''}
                </div>
              </div>
              <div class="footer">
                <p>Это письмо отправлено автоматически с портала <a href="https://uchiteltut.ru">УчительТут</a></p>
              </div>
            </div>
          </body>
          </html>
        `;

        const attachments = [];
        if (resumeFile) {
          attachments.push({
            filename: form.resumeFilename || 'resume.pdf',
            content: resumeFile,
            contentType: form.resumeMimetype,
          });
        }

        // Получатели: email из вакансии (если есть) и всегда на 79644228177@mail.ru
        const recipients = [];
        if (toEmail && toEmail.trim()) {
          recipients.push(toEmail.trim());
        }
        recipients.push('79644228177@mail.ru');
        
        // Убираем дубликаты
        const uniqueRecipients = [...new Set(recipients)];

        // Отправка письма
        const mailOptions = {
          from: process.env.MAIL_FROM || `"УчительТут" <${process.env.SMTP_USER}>`,
          to: uniqueRecipients,
          subject,
          text: textBody,
          html: htmlBody,
          attachments,
        };

        const info = await transporter.sendMail(mailOptions);
        request.log.info('Email sent successfully:', { 
          messageId: info.messageId, 
          recipients: uniqueRecipients.join(', ') 
        });

        return { 
          ok: true, 
          message: 'Отклик успешно отправлен',
          messageId: info.messageId 
        };
      } catch (err) {
        request.log.error('Error sending email:', err);
        reply.code(500);
        return { 
          error: 'Не удалось отправить отклик', 
          details: err.message,
          code: err.code 
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

