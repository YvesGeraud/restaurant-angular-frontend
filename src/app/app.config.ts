import { ApplicationConfig, provideBrowserGlobalErrorListeners, inject } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { InMemoryCache, split } from '@apollo/client/core';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';

import { authInterceptor } from './core/http/auth.interceptor';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideApollo(() => {
      const httpLink = inject(HttpLink);
      
      // Mapear de forma dinámica las URLs del backend basadas en environments
      const httpUrl = environment.apiUrl.replace(/\/api$/, '/graphql');
      const wsUrl = httpUrl.replace(/^http/, 'ws');

      const http = httpLink.create({
        uri: httpUrl,
        withCredentials: true,
      });

      const ws = new GraphQLWsLink(
        createClient({
          url: wsUrl,
        })
      );

      const link = split(
        ({ query }) => {
          const definition = getMainDefinition(query);
          return (
            definition.kind === 'OperationDefinition' &&
            definition.operation === 'subscription'
          );
        },
        ws,
        http
      );

      return {
        link,
        cache: new InMemoryCache(),
      };
    }),
  ],
};
