import { ApplicationConfig } from '@angular/core';
import { InMemoryCache, split } from '@apollo/client/core';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { HttpLink } from 'apollo-angular/http';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient } from 'graphql-ws';
import { environment } from '@environments/environment';
import { inject } from '@angular/core';

export function createApolloOptions() {
  const httpLink = inject(HttpLink);

  const http = httpLink.create({ uri: environment.graphqlUrl });

  const ws = new GraphQLWsLink(
    createClient({
      url: environment.graphqlWsUrl,
      connectionParams: () => {
        // Leer el accessToken de la cookie para autenticar la conexión WS
        const match = document.cookie.match(/(?:^|;\s*)accessToken=([^;]*)/);
        return match ? { authorization: `Bearer ${decodeURIComponent(match[1])}` } : {};
      },
      shouldRetry: () => true,
      retryAttempts: 5,
    }),
  );

  // Rutear subscriptions al link WS y el resto al link HTTP
  const link = split(
    ({ query }) => {
      const def = getMainDefinition(query);
      return def.kind === 'OperationDefinition' && def.operation === 'subscription';
    },
    ws,
    http,
  );

  return {
    link,
    cache: new InMemoryCache(),
  };
}

export const apolloConfig: ApplicationConfig['providers'][0] = {
  provide: 'APOLLO_OPTIONS',
  useFactory: createApolloOptions,
  deps: [HttpLink],
};
