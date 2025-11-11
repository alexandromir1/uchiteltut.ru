# Применение SMTP настроек на сервере

## Ваши настройки

```env
SMTP_HOST=smtp.yandex.ru
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=no-reply@uchiteltut.ru
SMTP_PASS=judjgxrcwxazgojh
MAIL_FROM="УчительТут <no-reply@uchiteltut.ru>"
```

## Шаг 1: Подключитесь к серверу

```bash
ssh root@91.229.9.105
```

## Шаг 2: Перейдите в директорию проекта

```bash
cd /opt/uchiteltut
```

## Шаг 3: Откройте файл .env

```bash
nano .env
```

## Шаг 4: Добавьте или обновите SMTP настройки

Найдите раздел с SMTP настройками и добавьте/обновите следующие строки:

```env
SMTP_HOST=smtp.yandex.ru
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=no-reply@uchiteltut.ru
SMTP_PASS=judjgxrcwxazgojh
MAIL_FROM="УчительТут <no-reply@uchiteltut.ru>"
```

**Важно:**
- Убедитесь, что нет лишних пробелов
- Пароль должен быть в одной строке без переносов
- Кавычки в MAIL_FROM должны быть двойными `"`

## Шаг 5: Сохраните файл

В nano:
- Нажмите `Ctrl + O` (сохранить)
- Нажмите `Enter` (подтвердить имя файла)
- Нажмите `Ctrl + X` (выйти)

## Шаг 6: Перезапустите сервер

```bash
docker-compose -f docker-compose.prod.yml restart server
```

Или если нужно пересобрать:

```bash
docker-compose -f docker-compose.prod.yml up -d --build server
```

## Шаг 7: Проверьте логи

```bash
docker-compose -f docker-compose.prod.yml logs -f server
```

Ищите сообщения:
- ✅ `SMTP connection verified` - подключение успешно
- ❌ Любые ошибки подключения - проверьте настройки

## Шаг 8: Тестовая отправка

1. Откройте сайт: https://uchiteltut.ru
2. Найдите любую вакансию с указанным email
3. Нажмите "Откликнуться на вакансию"
4. Заполните форму и отправьте
5. Проверьте почту:
   - Email из вакансии должен получить письмо
   - `79644228177@mail.ru` должен получить копию

## Быстрая команда (все в одной строке)

Если хотите быстро применить настройки, выполните:

```bash
cd /opt/uchiteltut && \
cat >> .env << 'EOF'

# SMTP настройки для Яндекс 360
SMTP_HOST=smtp.yandex.ru
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=no-reply@uchiteltut.ru
SMTP_PASS=judjgxrcwxazgojh
MAIL_FROM="УчительТут <no-reply@uchiteltut.ru>"
EOF
docker-compose -f docker-compose.prod.yml restart server
```

⚠️ **Внимание:** Эта команда добавит настройки в конец файла. Если настройки уже есть, лучше отредактировать файл вручную.

## Проверка настроек

Проверить, что настройки применены:

```bash
docker-compose -f docker-compose.prod.yml exec server env | grep SMTP
```

Должно показать:
```
SMTP_HOST=smtp.yandex.ru
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=no-reply@uchiteltut.ru
SMTP_PASS=judjgxrcwxazgojh
MAIL_FROM=УчительТут <no-reply@uchiteltut.ru>
```

## Устранение проблем

### Проблема: "SMTP не настроен"

**Решение:**
- Убедитесь, что переменные добавлены в `.env` файл
- Проверьте, что нет опечаток в именах переменных
- Перезапустите сервер после изменения `.env`

### Проблема: "SMTP verification failed"

**Решение:**
- Проверьте, что пароль приложения правильный (без пробелов)
- Убедитесь, что email ящика правильный: `no-reply@uchiteltut.ru`
- Проверьте, что домен верифицирован в Яндекс 360

### Проблема: Письма не отправляются

**Проверьте:**
1. Логи сервера: `docker-compose -f docker-compose.prod.yml logs server | grep -i smtp`
2. Убедитесь, что в вакансии указан email
3. Проверьте спам-папку получателей

## Готово!

После применения настроек отправка писем должна работать автоматически при каждом отклике на вакансию.

