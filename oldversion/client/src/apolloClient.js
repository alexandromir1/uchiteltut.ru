import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const GRAPHQL_URL = process.env.REACT_APP_GRAPHQL_URL || 'http://localhost:4000/graphql';

// HTTP link
const httpLink = createHttpLink({
  uri: GRAPHQL_URL,
});

// Auth link - добавляет токен в заголовки
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

// Apollo Client
export const apolloClient = new ApolloClient({
  link: from([authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
  },
});

