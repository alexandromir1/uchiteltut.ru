# Подключение к GraphQL серверу

Клиент успешно подключен к новому GraphQL бэкенду.

## Что было сделано:

1. ✅ Создан Apollo Client конфигурация (`src/apolloClient.js`)
2. ✅ Добавлен ApolloProvider в `App.js`
3. ✅ Обновлен `AuthContext` для использования GraphQL мутаций
4. ✅ Обновлен `useJobs` хук для GraphQL запросов
5. ✅ Обновлен `JobDetail` компонент для GraphQL
6. ✅ Созданы GraphQL queries и mutations

## Настройка переменных окружения

Создайте файл `.env` в папке `client`:

```env
REACT_APP_GRAPHQL_URL=http://localhost:4000/graphql
```

## Запуск

### 1. Запустите GraphQL сервер

```bash
cd newServer
npm run dev
```

Сервер будет доступен на http://localhost:4000/graphql

### 2. Запустите клиент

```bash
cd client
npm start
```

Клиент будет доступен на http://localhost:3000

## Структура GraphQL файлов

```
client/src/
├── apolloClient.js          # Конфигурация Apollo Client
├── graphql/
│   ├── queries.js           # GraphQL запросы
│   └── mutations.js         # GraphQL мутации
└── context/
    └── AuthContext.jsx      # Обновлен для GraphQL
```

## Основные изменения:

### AuthContext
- Использует `useMutation` для login/register
- Использует `useLazyQuery` для получения текущего пользователя

### useJobs
- Использует `useQuery(GET_JOBS)` для получения вакансий
- Использует `useMutation` для создания/удаления вакансий

### JobDetail
- Использует `useQuery(GET_JOB)` для получения одной вакансии

## GraphQL Endpoints

Все запросы идут на: `http://localhost:4000/graphql`

### Примеры запросов:

**Регистрация:**
```graphql
mutation {
  register(input: {
    email: "test@example.com"
    password: "password123"
    name: "Test User"
    role: "teacher"
  }) {
    token
    user {
      id
      email
      name
    }
  }
}
```

**Получение вакансий:**
```graphql
query {
  jobs(active: true) {
    id
    position
    school
    region
    salary
  }
}
```

## Проверка подключения

1. Убедитесь, что GraphQL сервер запущен
2. Откройте GraphQL Playground: http://localhost:4000/graphql
3. Запустите клиент и попробуйте зарегистрироваться или войти
4. Проверьте консоль браузера на наличие ошибок

## Troubleshooting

### Ошибка: "Cannot connect to GraphQL server"

- Проверьте, что сервер запущен на порту 4000
- Проверьте переменную окружения `REACT_APP_GRAPHQL_URL`
- Проверьте CORS настройки на сервере

### Ошибка: "Authentication required"

- Убедитесь, что токен сохраняется в localStorage
- Проверьте, что токен передается в заголовках запросов

