import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  generators: {
    client: {
      provider: "prisma-client-js",
      // Vercel/Node-API のデフォルト同梱先を明示
      output: "node_modules/.prisma/client",
    },
  },
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});


