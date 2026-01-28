export interface AppConfig {
  env: "development" | "production" | "test";
  port: number;
  databaseUrl?: string;
  jwtSecret?: string;
  serviceToken?: string;
  geminiApiKey?: string;
}

export default (): AppConfig => {
  const resolvedEnv = (process.env.NODE_ENV ??
    "development") as AppConfig["env"];

  return {
    env: resolvedEnv,
    port: Number(process.env.PORT ?? 3001),
    databaseUrl: process.env.DATABASE_URL,
    jwtSecret: process.env.JWT_SECRET,
    serviceToken: process.env.SERVICE_TOKEN,
    geminiApiKey: process.env.GEMINI_API_KEY,
  };
};
