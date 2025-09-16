import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        baseURL: configService.get<string>("KOTLIN_SERVICE_URL") ?? undefined,
        timeout: configService.get<number>("HTTP_TIMEOUT") ?? 5000,
        maxRedirects: 0,
      }),
    }),
  ],
  exports: [HttpModule],
})
export class KotlinHttpModule {}
