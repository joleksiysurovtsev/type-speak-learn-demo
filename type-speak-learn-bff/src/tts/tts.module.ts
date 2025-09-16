import { Module } from "@nestjs/common";
import { TtsService } from "./tts.service";
import { TtsController } from "./tts.controller";
import { KotlinHttpModule } from "../http/kotlin-http.module";

@Module({
  imports: [KotlinHttpModule],
  controllers: [TtsController],
  providers: [TtsService],
})
export class TtsModule {}
