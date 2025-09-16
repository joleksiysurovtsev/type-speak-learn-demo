import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { BlocksModule } from "./blocks/blocks.module";
import { TtsModule } from "./tts/tts.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env", "apps/bff/.env"],
    }),
    BlocksModule,
    TtsModule,
  ],
})
export class AppModule {}
