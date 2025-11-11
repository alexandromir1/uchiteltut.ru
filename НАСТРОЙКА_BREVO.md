# Настройка Brevo (Sendinblue) для отправки писем через HTTP API

## Проблема с SMTP

Если порты SMTP (465, 587) заблокированы провайдером, используйте HTTP API вместо SMTP.

## Регистрация в Brevo

1. Перейдите на https://www.brevo.com/
2. Зарегистрируйтесь (бесплатный тариф - 300 писем/день)
3. Подтвердите email

## Получение API ключа

1. Войдите в панель Brevo
2. Перейдите в **Settings** → **API Keys**
3. Нажмите **Generate a new API key**
4. Скопируйте API ключ (показывается только один раз!)

## Настройка на сервере

Подключитесь к серверу:

```bash
ssh root@91.229.9.105
cd /opt/uchiteltut
nano .env
```

Добавьте следующие строки:

```env
# HTTP API для отправки писем (Brevo/Sendinblue)
EMAIL_API_URL=https://api.brevo.com/v3/smtp/email
EMAIL_API_KEY=ваш_api_ключ_из_brevo
EMAIL_FROM=noreply@uchiteltut.ru
```

**Важно:** Не удаляйте старые SMTP настройки, они будут использоваться как резерв.

## Перезапуск сервера

```bash
docker-compose -f docker-compose.prod.yml restart server
```

## Проверка

Попробуйте отправить отклик на вакансию через сайт. Письма должны отправляться через HTTP API.

## Преимущества HTTP API

✅ Не требует открытых SMTP портов  
✅ Работает через стандартный HTTPS (порт 443)  
✅ Более надежная доставляемость  
✅ Бесплатный тариф 300 писем/день  
✅ Подробная статистика отправки

## Альтернативы

Если Brevo не подходит, можно использовать:
- **Mailgun** - https://www.mailgun.com/ (5000 писем/месяц бесплатно)
- **SendGrid** - https://sendgrid.com/ (100 писем/день бесплатно)
- **Amazon SES** - https://aws.amazon.com/ses/ (платный, но дешевый)

Для других сервисов измените `EMAIL_API_URL` в `.env`.

