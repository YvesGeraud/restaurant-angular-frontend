import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: [
    '../Backend/src/graphql/schema/scalars.graphql',
    '../Backend/src/graphql/schema/index.graphql',
    '../Backend/src/graphql/schema/categoria.graphql',
    '../Backend/src/graphql/schema/platillo.graphql',
    '../Backend/src/graphql/schema/mesa.graphql',
    '../Backend/src/graphql/schema/orden.graphql',
    '../Backend/src/graphql/schema/reservacion.graphql',
  ],
  documents: 'src/graphql/**/*.graphql',
  generates: {
    // 1. Tipos base de TypeScript correspondientes al Schema del Backend
    'src/generated/graphql-types.ts': {
      plugins: ['typescript'],
      config: {
        enumsAsTypes: true,
      },
    },
    // 2. Generación local near-operation-file para cada archivo .graphql
    'src/': {
      preset: 'near-operation-file',
      presetConfig: {
        baseTypesPath: 'generated/graphql-types',
        extension: '.generated.ts',
      },
      plugins: ['typescript-operations', 'typescript-apollo-angular'],
      config: {
        addExplicitOverride: true,
      },
    },
  },
};

export default config;
