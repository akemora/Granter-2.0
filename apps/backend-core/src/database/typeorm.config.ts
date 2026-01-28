import { ConfigService } from "@nestjs/config";
import { TypeOrmModuleOptions } from "@nestjs/typeorm";

export const typeOrmConfigFactory = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const isProduction = configService.get("env") === "production";
  const extension = isProduction ? "js" : "ts";

  return {
    type: "postgres",
    url: configService.get<string>("databaseUrl"),
    synchronize: !isProduction,
    logging: !isProduction,
    entities: [__dirname + `/entities/*.${extension}`],
    migrations: [],
    autoLoadEntities: true,
    migrationsRun: false,
    dropSchema: false,
  };
};
