# Настройка Mailgun для отправки писем

## Шаг 1: Регистрация в Mailgun

1. Перейдите на https://www.mailgun.com/
2. Зарегистрируйтесь (есть бесплатный тариф - 5000 писем/месяц)
3. После регистрации подтвердите email

## Шаг 2: Получение SMTP данных

1. Войдите в панель Mailgun
2. Перейдите в **Sending** → **Domain Settings**
3. Выберите ваш домен (или создайте новый)
4. Перейдите на вкладку **SMTP credentials**
5. Скопируйте:
   - **SMTP hostname**: `smtp.mailgun.org`
   - **Port**: `587` (или `2525`)
   - **Username**: `postmaster@YOUR_DOMAIN.mailgun.org`
   - **Password**: SMTP password (нажмите "Reset password" если нужно)

## Шаг 3: Настройка на сервере

Подключитесь к VPS и обновите `.env` файл:

```bash
ssh root@91.229.9.105
cd /opt/uchiteltut
nano .env
```

Добавьте/обновите следующие строки:

```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=postmaster@YOUR_DOMAIN.mailgun.org
SMTP_PASS=ваш_smtp_пароль_из_mailgun
MAIL_FROM="УчительТут <noreply@uchiteltut.ru>"
```

Сохраните файл (Ctrl+O, Enter, Ctrl+X) и перезапустите сервер:

```bash
docker-compose -f docker-compose.prod.yml restart server
```

## Альтернатива: Brevo (Sendinblue)

Если Mailgun не подходит, можно использовать Brevo (бывший Sendinblue):

1. Регистрация: https://www.brevo.com/
2. SMTP настройки:
   - Host: `smtp-relay.brevo.com`
   - Port: `587`
   - Username: ваш email в Brevo
   - Password: SMTP key из настроек

## Проверка

После настройки попробуйте отправить отклик на вакансию через форму на сайте.

