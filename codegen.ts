import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  overwrite: true,
  schema: "https://api.airstack.xyz/gql",
  documents: ["src/**/*.tsx", "src/**/*.ts"],
  generates: {
    // Output type file
    "src/graphql/types.ts": {
      plugins: ["typescript", "typescript-operations"],
      config: {
        avoidOptionals: true,
        skipTypename: true,
      },
    },
  },
};

export default config;
