# Инструкция по настройке Brevo API

## Проблема
В файле `.env` на сервере указан плейсхолдер `ваш_api_ключ_из_brevo` вместо реального API ключа.

## Решение

### Шаг 1: Получите реальный API ключ из Brevo

1. Войдите в панель Brevo: https://www.brevo.com/
2. Перейдите в **Settings** → **API Keys**
3. Нажмите **Generate a new API key** (или используйте существующий)
4. **Скопируйте API ключ** (он выглядит как длинная строка букв и цифр, например: `xkeysib-1234567890abcdef...`)

### Шаг 2: Обновите .env на сервере

Подключитесь к серверу:

```bash
ssh root@91.229.9.105
cd /opt/uchiteltut
nano .env
```

Найдите строки:
```env
EMAIL_API_URL=https://api.brevo.com/v3/smtp/email
EMAIL_API_KEY=ваш_api_ключ_из_brevo
EMAIL_FROM=noreply@uchiteltut.ru
```

Замените `ваш_api_ключ_из_brevo` на **реальный API ключ** из Brevo:

```env
EMAIL_API_URL=https://api.brevo.com/v3/smtp/email
EMAIL_API_KEY=xkeysib-ваш_реальный_ключ_здесь
EMAIL_FROM=noreply@uchiteltut.ru
```

**Важно:** 
- Убедитесь, что нет пробелов вокруг знака `=`
- API ключ должен быть в одной строке без переносов
- Сохраните файл: `Ctrl+O`, `Enter`, `Ctrl+X`

### Шаг 3: Перезапустите сервер

```bash
docker-compose -f docker-compose.prod.yml restart server
```

### Шаг 4: Проверьте логи

```bash
docker-compose -f docker-compose.prod.yml logs -f server
```

Попробуйте отправить отклик на сайте. В логах должно появиться:
- `Using HTTP API for email sending`
- `Email sent via HTTP API`

## Проверка настроек

Выполните команду для проверки:

```bash
cd /opt/uchiteltut
grep EMAIL .env
```

Должно быть:
```
EMAIL_API_URL=https://api.brevo.com/v3/smtp/email
EMAIL_API_KEY=xkeysib-ваш_реальный_ключ
EMAIL_FROM=noreply@uchiteltut.ru
```

**НЕ должно быть:**
- `EMAIL_API_KEY=ваш_api_ключ_из_brevo` ❌

## Если все еще не работает

1. Проверьте, что API ключ правильный в Brevo
2. Убедитесь, что email `noreply@uchiteltut.ru` верифицирован в Brevo (или используйте другой верифицированный email)
3. Проверьте логи сервера на наличие ошибок
4. Убедитесь, что сервер перезапущен после изменения .env

